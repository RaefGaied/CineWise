import { ServerUnaryCall, ServerDuplexStream, sendUnaryData, status } from '@grpc/grpc-js';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { format } from 'date-fns';
import { KafkaProducerService } from '../kafka/producer.service';
import { UserActivityEvent } from '../kafka/kafka.config';

interface RegisterUserRequest {
    name: string;
    email: string;
}

interface GetUserRequest {
    user_id: string;
}

interface UpdateUserRequest {
    user_id: string;
    name: string;
    email: string;
}

interface DeleteUserRequest {
    user_id: string;
}

interface UserEventAck {
    success: boolean;
    message_id: string;
}

export class GrpcUserService {
    private userService: UserService;
    private authService: AuthService;
    private kafkaProducer: KafkaProducerService;

    constructor() {
        this.userService = new UserService();
        this.authService = new AuthService();
        this.kafkaProducer = new KafkaProducerService();
        this.initializeKafka();
    }

    private async initializeKafka(): Promise<void> {
        let retries = 0;
        const maxRetries = 5;
        const retryInterval = 5000; // 5 seconds

        while (retries < maxRetries) {
            try {
                await this.kafkaProducer.connect();
                console.log('Successfully connected to Kafka');
                return;
            } catch (error) {
                console.error(`Failed to connect to Kafka (attempt ${retries + 1}/${maxRetries}):`, error);
                retries++;
                if (retries < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryInterval));
                }
            }
        }
        console.error('Failed to initialize Kafka producer after maximum retries');
    }

    async registerUser(
        call: ServerUnaryCall<RegisterUserRequest, any>,
        callback: sendUnaryData<any>
    ): Promise<void> {
        try {
            const { name, email } = call.request;
            
            const tempPassword = Math.random().toString(36).slice(-8);
            
            const result = await this.authService.register({
                email,
                username: name,
                password: tempPassword
            });

            callback(null, {
                user: {
                    id: result.user._id,
                    name: result.user.username,
                    email: result.user.email,
                    created_at: format(result.user.createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                    updated_at: format(result.user.updatedAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                    profile_picture: result.user.profilePicture || '',
                    preferences: result.user.preferences.favoriteGenres || []
                }
            });
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: (error as Error).message
            });
        }
    }

    async getUser(
        call: ServerUnaryCall<GetUserRequest, any>,
        callback: sendUnaryData<any>
    ): Promise<void> {
        try {
            const user = await this.userService.getUserById(call.request.user_id);
            
            callback(null, {
                user: {
                    id: user._id,
                    name: user.username,
                    email: user.email,
                    created_at: format(user.createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                    updated_at: format(user.updatedAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                    profile_picture: user.profilePicture || '',
                    preferences: user.preferences.favoriteGenres || []
                }
            });
        } catch (error) {
            callback({
                code: status.NOT_FOUND,
                message: (error as Error).message
            });
        }
    }

    async updateUser(
        call: ServerUnaryCall<UpdateUserRequest, any>,
        callback: sendUnaryData<any>
    ): Promise<void> {
        try {
            const { user_id, name } = call.request;
            
            const user = await this.userService.updateUser(user_id, {
                firstName: name
            });

            callback(null, {
                user: {
                    id: user._id,
                    name: user.username,
                    email: user.email,
                    created_at: format(user.createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                    updated_at: format(user.updatedAt, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                    profile_picture: user.profilePicture || '',
                    preferences: user.preferences.favoriteGenres || []
                }
            });
        } catch (error) {
            callback({
                code: status.INTERNAL,
                message: (error as Error).message
            });
        }
    }

    async deleteUser(
        call: ServerUnaryCall<DeleteUserRequest, any>,
        callback: sendUnaryData<any>
    ): Promise<void> {
        try {
            await this.userService.deleteUser(call.request.user_id);
            callback(null, { success: true });
        } catch (error) {
            callback({
                code: status.NOT_FOUND,
                message: (error as Error).message
            });
        }
    }

    async emitUserActivity(
        call: ServerDuplexStream<UserActivityEvent, UserEventAck>
    ): Promise<void> {
        call.on('data', async (rawEvent: UserActivityEvent) => {
            try {
                // No need for camelcase-keys conversion since we're using TypeScript types
                const event = {
                    eventType: rawEvent.eventType,
                    userId: rawEvent.userId,
                    movieId: rawEvent.movieId,
                    timestamp: rawEvent.timestamp,
                    watchDuration: rawEvent.watchDuration,
                    rating: rawEvent.rating
                } as UserActivityEvent;
                
                const messageId = `${event.userId}-${event.movieId}-${Date.now()}`;
    
                // Process different event types
                switch (event.eventType) {
                    case 'WATCHED':
                        await this.userService.addToWatchlist(event.userId, event.movieId);
                        await this.kafkaProducer.publishUserActivity({
                            eventType: 'WATCHED',
                            userId: event.userId,
                            movieId: event.movieId,
                            timestamp: event.timestamp,
                            watchDuration: event.watchDuration
                        });
                        break;
                    case 'RATED':
                        if (event.rating !== undefined) {
                            // Publier sur Kafka
                            await this.kafkaProducer.publishUserActivity({
                                eventType: 'RATED',
                                userId: event.userId,
                                movieId: event.movieId,
                                timestamp: event.timestamp,
                                rating: event.rating
                            });
                        }
                        break;
                }
    
                // Envoyer l'accusé de réception
                const ack: UserEventAck = {
                    success: true,
                    message_id: messageId
                };
                call.write(ack);
    
            } catch (error) {
                console.error('Error processing user activity:', error);
                const ack: UserEventAck = {
                    success: false,
                    message_id: `error-${Date.now()}`
                };
                call.write(ack);
            }
        });
    
        call.on('end', async () => {
            call.end();
        });
    
        call.on('error', (error) => {
            console.error('Error in user activity stream:', error);
            call.end();
        });
    }

    async close(): Promise<void> {
        await this.kafkaProducer.disconnect();
    }
}

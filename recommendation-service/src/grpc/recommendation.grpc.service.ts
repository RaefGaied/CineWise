import { ServerUnaryCall, ServerWritableStream, ServerReadableStream, sendUnaryData, ServerDuplexStream, status } from '@grpc/grpc-js';
import { RecommendationService } from '../services/recommendation.service';
import { formatISO } from 'date-fns';

interface RecommendedMovie {
    movie_id: string;
    score: number;
}

interface GetRecommendationsRequest {
    user_id: string;
}

interface GetRecommendationsResponse {
    recommendation: {
        user_id: string;
        movies: RecommendedMovie[];
        generated_at: string;
        algorithm: string;
    };
    error_message?: string;
}

interface UserEvent {
    event_type: string;
    user_id: string;
    movie_id: string;
    timestamp: string;
    rating?: number;
    watch_duration?: number;
}

interface RecommendationEventAck {
    success: boolean;
    message_id: string;
}

export class GrpcRecommendationService {
    private recommendationService: RecommendationService;

    constructor() {
        this.recommendationService = new RecommendationService();
    }

    async getRecommendations(
        call: ServerUnaryCall<GetRecommendationsRequest, GetRecommendationsResponse>,
        callback: sendUnaryData<GetRecommendationsResponse>
    ): Promise<void> {
        try {
            const { user_id } = call.request;
            const recommendedMovies = await this.recommendationService.getPersonalizedRecommendations(user_id);

            const response: GetRecommendationsResponse = {
                recommendation: {
                    user_id,
                    movies: recommendedMovies
                        .filter(movie => movie._id !== undefined)  
                        .map(movie => ({
                            movie_id: movie._id as string,  
                            score: movie.rating || 0
                        })),
                    generated_at: formatISO(new Date()),
                    algorithm: 'hybrid-collaborative-filtering'
                }
            };

            callback(null, response);
        } catch (error) {
            console.error('Error in getRecommendations:', error);
            callback({
                code: status.INTERNAL,
                message: 'Internal server error while getting recommendations'
            });
        }
    }

    processUserEvent(
        call: ServerDuplexStream<UserEvent, RecommendationEventAck>
    ): void {
        call.on('data', async (event: UserEvent) => {
            try {
                const messageId = `${event.user_id}-${event.movie_id}-${Date.now()}`;

                switch (event.event_type) {
                    case 'WATCHED_MOVIE':
                        await this.recommendationService.updateUserPreference(
                            event.user_id,
                            event.movie_id
                        );
                        break;

                    case 'RATED_MOVIE':
                        if (event.rating !== undefined) {
                            await this.recommendationService.updateUserPreference(
                                event.user_id,
                                event.movie_id,
                                event.rating
                            );
                        }
                        break;
                }

              
                const ack: RecommendationEventAck = {
                    success: true,
                    message_id: messageId
                };
                call.write(ack);

            } catch (error) {
                console.error('Error processing user event:', error);
                const ack: RecommendationEventAck = {
                    success: false,
                    message_id: `error-${Date.now()}`
                };
                call.write(ack);
            }
        });

        call.on('end', () => {
            call.end();
        });

        call.on('error', (error) => {
            console.error('Error in user event stream:', error);
            call.end();
        });
    }
}
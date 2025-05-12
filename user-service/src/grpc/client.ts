import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const userProto: any = grpc.loadPackageDefinition(packageDefinition).user;

export class UserClient {
    private client: any;

    constructor(address: string = 'localhost:50053') {
        this.client = new userProto.UserService(
            address,
            grpc.credentials.createInsecure()
        );
    }

    registerUser(name: string, email: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.registerUser({ name, email }, (error: any, response: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    getUser(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.getUser({ user_id: userId }, (error: any, response: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    updateUser(userId: string, name: string, email: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.updateUser({ user_id: userId, name, email }, (error: any, response: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    deleteUser(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.deleteUser({ user_id: userId }, (error: any, response: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    emitUserActivity(): grpc.ClientDuplexStream<any, any> {
        return this.client.emitUserActivity();
    }
}

// 🔧 Fonction pour nettoyer un objet avant envoi
function cleanEvent(event: any): any {
    const cleaned: any = {};
    for (const key in event) {
        if (event[key] !== undefined && event[key] !== null) {
            cleaned[key] = event[key];
        }
    }
    return cleaned;
}

// Example usage:
async function testClient() {
    const client = new UserClient();

    try {
        // Test user registration
        console.log('Testing user registration...');
        const registerResult = await client.registerUser('Test User', 'test@example.com');
        console.log('Registration result:', registerResult);

        if (registerResult.user) {
            const userId = registerResult.user.id;

            // Test get user
            console.log('\nTesting get user...');
            const getResult = await client.getUser(userId);
            console.log('Get user result:', getResult);

            // Test update user
            console.log('\nTesting update user...');
            const updateResult = await client.updateUser(userId, 'Updated Name', 'updated@example.com');
            console.log('Update result:', updateResult);

            // Test user activity stream
            console.log('\nTesting user activity stream...');
            const stream = client.emitUserActivity();

            stream.on('data', (response: any) => {
                console.log('Received acknowledgment:', response);
            });

            stream.on('end', () => {
                console.log('Stream ended');
            });

            stream.on('error', (err: any) => {
                console.error('Stream error:', err);
            });

            // Send some test events
            const events = [
                {
                    event_type: 'WATCHED',
                    user_id: userId,
                    movie_id: 'movie123',
                    timestamp: new Date().toISOString(),
                    watch_duration: 7200
                },
                {
                    event_type: 'RATED',
                    user_id: userId,
                    movie_id: 'movie123',
                    timestamp: new Date().toISOString(),
                    rating: 4.5
                }
            ];

            for (const event of events) {
                const cleanedEvent = cleanEvent(event);
                stream.write(cleanedEvent);
                console.log('Sent cleaned event:', cleanedEvent);
            }

            // End the stream after sending events
            setTimeout(() => {
                stream.end();

                // Test delete user
                console.log('\nTesting delete user...');
                client.deleteUser(userId)
                    .then(deleteResult => {
                        console.log('Delete result:', deleteResult);
                        process.exit(0);
                    })
                    .catch(console.error);
            }, 1000);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testClient();
}

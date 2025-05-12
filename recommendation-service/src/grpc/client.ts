import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/recommendation.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const recommendationProto: any = grpc.loadPackageDefinition(packageDefinition).recommendation;

export class RecommendationClient {
    private client: any;

    constructor(address: string = 'localhost:50052') {
        this.client = new recommendationProto.RecommendationService(
            address,
            grpc.credentials.createInsecure()
        );
    }

    getRecommendations(userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.getRecommendations({ user_id: userId }, (error: any, response: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(response);
            });
        });
    }

    processUserEvents(): grpc.ClientDuplexStream<any, any> {
        return this.client.processUserEvent();
    }
}

// Example usage:
async function testClient() {
    const client = new RecommendationClient();

    try {
        // Test getRecommendations
        console.log('Testing getRecommendations...');
        const recommendations = await client.getRecommendations('user123');
        console.log('Recommendations:', recommendations);

        // Test processUserEvent
        console.log('\nTesting processUserEvent...');
        const stream = client.processUserEvents();

        stream.on('data', (response: any) => {
            console.log('Received acknowledgment:', response);
        });

        stream.on('end', () => {
            console.log('Stream ended');
        });

        // Send some test events
        const events = [
            {
                event_type: 'WATCHED_MOVIE',
                user_id: 'user123',
                movie_id: 'movie456',
                timestamp: new Date().toISOString(),
                watch_duration: 7200
            },
            {
                event_type: 'RATED_MOVIE',
                user_id: 'user123',
                movie_id: 'movie456',
                timestamp: new Date().toISOString(),
                rating: 4.5
            }
        ];

        for (const event of events) {
            stream.write(event);
            console.log('Sent event:', event);
        }

        // End the stream after sending all events
        setTimeout(() => {
            stream.end();
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testClient();
} 
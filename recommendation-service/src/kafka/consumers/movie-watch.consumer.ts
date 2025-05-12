import { Kafka, Consumer } from 'kafkajs';
import { RecommendationService } from '../../services/recommendation.service';

export class MovieWatchConsumer {
    private consumer: Consumer;
    private recommendationService: RecommendationService;

    constructor() {
        const kafka = new Kafka({
            clientId: 'recommendation-service',
            brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
        });

        this.consumer = kafka.consumer({ groupId: 'recommendation-service-group' });
        this.recommendationService = new RecommendationService();
    }

    async start(): Promise<void> {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topic: 'movie-watches', fromBeginning: false });

            await this.consumer.run({
                eachMessage: async ({ message }) => {
                    try {
                        if (!message.value) return;

                        const event = JSON.parse(message.value.toString());
                        const { userId, movieId, genres } = event;

                        await this.recommendationService.updateUserPreference(
                            userId,
                            movieId,
                            undefined, 
                            genres
                        );

                        console.log(`Processed watch event for user ${userId} and movie ${movieId}`);
                    } catch (error) {
                        console.error('Error processing message:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Error starting consumer:', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        try {
            await this.consumer.disconnect();
        } catch (error) {
            console.error('Error stopping consumer:', error);
            throw error;
        }
    }
} 
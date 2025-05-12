import { Producer } from 'kafkajs';
import { kafka, topics, UserActivityEvent, UserPreferenceEvent, UserWatchlistEvent } from './kafka.config';

export class KafkaProducerService {
    private producer: Producer;
    private isConnected: boolean = false;

    constructor() {
        this.producer = kafka.producer();
    }

    async connect(): Promise<void> {
        if (!this.isConnected) {
            try {
                await this.producer.connect();
                this.isConnected = true;
                console.log('Successfully connected to Kafka');
            } catch (error) {
                console.error('Failed to connect to Kafka:', error);
                throw error;
            }
        }
    }

    async disconnect(): Promise<void> {
        if (this.isConnected) {
            try {
                await this.producer.disconnect();
                this.isConnected = false;
                console.log('Successfully disconnected from Kafka');
            } catch (error) {
                console.error('Failed to disconnect from Kafka:', error);
                throw error;
            }
        }
    }

    async publishUserActivity(event: UserActivityEvent): Promise<void> {
        await this.ensureConnection();
        try {
            await this.producer.send({
                topic: topics.USER_ACTIVITY,
                messages: [
                    {
                        key: event.userId,
                        value: JSON.stringify(event),
                        timestamp: Date.now().toString()
                    }
                ]
            });
            console.log(`Published user activity event for user ${event.userId}`);
        } catch (error) {
            console.error('Failed to publish user activity event:', error);
            throw error;
        }
    }

    async publishUserPreferences(event: UserPreferenceEvent): Promise<void> {
        await this.ensureConnection();
        try {
            await this.producer.send({
                topic: topics.USER_PREFERENCES,
                messages: [
                    {
                        key: event.userId,
                        value: JSON.stringify(event),
                        timestamp: Date.now().toString()
                    }
                ]
            });
            console.log(`Published user preferences event for user ${event.userId}`);
        } catch (error) {
            console.error('Failed to publish user preferences event:', error);
            throw error;
        }
    }

    async publishWatchlistUpdate(event: UserWatchlistEvent): Promise<void> {
        await this.ensureConnection();
        try {
            await this.producer.send({
                topic: topics.USER_WATCHLIST,
                messages: [
                    {
                        key: event.userId,
                        value: JSON.stringify(event),
                        timestamp: Date.now().toString()
                    }
                ]
            });
            console.log(`Published watchlist update event for user ${event.userId}`);
        } catch (error) {
            console.error('Failed to publish watchlist update event:', error);
            throw error;
        }
    }

    private async ensureConnection(): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }
    }
} 
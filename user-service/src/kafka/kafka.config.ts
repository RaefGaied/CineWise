import { Kafka, KafkaConfig, Partitioners } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const broker = process.env.KAFKA_BROKER || 'kafka:9092';

export const kafkaConfig: KafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'user-service',
  brokers: [broker],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
};

// Create Kafka instance
export const kafka = new Kafka(kafkaConfig);

// Configure producer with legacy partitioner when creating it
export const createProducer = () => kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

export const topics = {
  USER_ACTIVITY: 'user-activity',
  USER_PREFERENCES: 'user-preferences',
  USER_WATCHLIST: 'user-watchlist',
};

export interface UserActivityEvent {
  eventType: 'WATCHED' | 'RATED' | 'FAVORITED' | 'WATCHLISTED';
  userId: string;
  movieId: string;
  timestamp: string;
  rating?: number;
  watchDuration?: number;
}

export interface UserPreferenceEvent {
  userId: string;
  preferences: {
    favoriteGenres: string[];
    preferredLanguages: string[];
    contentRating: string[];
  };
  timestamp: string;
}

export interface UserWatchlistEvent {
  userId: string;
  movieId: string;
  action: 'ADD' | 'REMOVE';
  timestamp: string;
}

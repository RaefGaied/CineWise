import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import recommendationController from './controllers/recommendation.controller';
import { MovieWatchConsumer } from './kafka/consumers/movie-watch.consumer';
import { startGrpcServer } from './grpc/server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const GRPC_PORT = process.env.GRPC_PORT || '50052';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinewise-recommendations';
app.use(cors());
app.use(express.json());


app.use('/api/recommendations', recommendationController);


app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Start the REST server
        app.listen(PORT, () => {
            console.log(`REST server listening on port ${PORT}`);
        });

       
        startGrpcServer(GRPC_PORT);

       
        const movieWatchConsumer = new MovieWatchConsumer();
        movieWatchConsumer.start()
            .then(() => console.log('Kafka consumer started'))
            .catch(error => console.error('Failed to start Kafka consumer:', error));
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });


process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    process.exit(0);
}); 
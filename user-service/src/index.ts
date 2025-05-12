import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authController from './controllers/auth.controller';
import userController from './controllers/user.controller';
import { startGrpcServer } from './grpc/server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const GRPC_PORT = process.env.GRPC_PORT || '50053';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinewise-users';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authController);
app.use('/api/users', userController);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        
        // Start the REST server
        app.listen(PORT, () => {
            console.log(`REST server listening on port ${PORT}`);
        });

        // Start the gRPC server
        startGrpcServer(GRPC_PORT);
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});
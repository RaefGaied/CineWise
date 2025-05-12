import express from 'express';
import cors from 'cors';
import * as grpc from '@grpc/grpc-js';
import { connectDB } from './config/database';
import movieController from './controllers/movie_controller';
import { movieService, movieGrpcHandlers } from './grpc/movie_grpc_service';
import dotenv from 'dotenv';
import { Server } from 'http';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieController);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'movie-service' });
});


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


const grpcServer = new grpc.Server();
grpcServer.addService(movieService.service, movieGrpcHandlers);

const PORT = process.env.PORT || 3000;
const GRPC_PORT = process.env.GRPC_PORT || 50051;

let httpServer: Server;

export async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

  
    httpServer = app.listen(PORT, () => {
      console.log(`REST API Server running on http://localhost:${PORT}`);
    });

   
    grpcServer.bindAsync(
      `0.0.0.0:${GRPC_PORT}`,
      grpc.ServerCredentials.createInsecure(),
      (error, port) => {
        if (error) {
          console.error('Failed to bind gRPC server:', error);
          return;
        }
        grpcServer.start();
        console.log(`gRPC Server running on 0.0.0.0:${port}`);
      }
    );

  } catch (error) {
    console.error('Failed to start servers:', error);
    throw error;
  }
}


process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  
  
  grpcServer.tryShutdown(() => {
    console.log('gRPC server shut down');
  });
  if (httpServer) {
    httpServer.close(() => {
      console.log('HTTP server closed');
    });
  }
  process.exit(0);
});


process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


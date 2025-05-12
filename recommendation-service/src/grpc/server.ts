import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcRecommendationService } from './recommendation.grpc.service';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/recommendation.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const recommendationProto: any = grpc.loadPackageDefinition(packageDefinition).recommendation;

export function startGrpcServer(port: string = '50052'): void {
    const server = new grpc.Server();
    const recommendationService = new GrpcRecommendationService();

    server.addService(recommendationProto.RecommendationService.service, {
        getRecommendations: recommendationService.getRecommendations.bind(recommendationService),
        processUserEvent: recommendationService.processUserEvent.bind(recommendationService)
    });

    server.bindAsync(
        `0.0.0.0:${port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('Failed to start gRPC server:', error);
                return;
            }
            server.start();
            console.log(`gRPC server running on port ${port}`);
        }
    );

   
    const shutdown = () => {
        console.log('Shutting down gRPC server...');
        server.tryShutdown(() => {
            console.log('gRPC server stopped');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
} 
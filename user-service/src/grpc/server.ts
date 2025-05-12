import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcUserService } from './user.grpc.service';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/user.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const userProto: any = grpc.loadPackageDefinition(packageDefinition).user;

export function startGrpcServer(port: string = '50053'): void {
    const server = new grpc.Server();
    const userService = new GrpcUserService();

    server.addService(userProto.UserService.service, {
        registerUser: userService.registerUser.bind(userService),
        getUser: userService.getUser.bind(userService),
        updateUser: userService.updateUser.bind(userService),
        deleteUser: userService.deleteUser.bind(userService),
        emitUserActivity: userService.emitUserActivity.bind(userService)
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

    // Graceful shutdown
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
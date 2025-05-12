import { startServer } from './server';

startServer().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
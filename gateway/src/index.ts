import express, { Application } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageLocalDefault
} from 'apollo-server-core'; // 🔄 Utilise Sandbox
import winston from 'winston';

import { services } from './config/services.config';
import { authMiddleware, requireRole, AuthenticatedRequest } from './middleware/auth.middleware';
import { schema } from './graphql/schema';

// Logger config
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

// Express app setup
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// GraphQL & Apollo setup
async function startApolloServer() {
  const server = new ApolloServer({
    schema,
    context: ({ req }: { req: AuthenticatedRequest }) => ({
      user: req.user
    }),
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return error;
    },
    introspection: true,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }) // 🔥 Active Apollo Sandbox
    ]
  });

  await server.start();

  server.applyMiddleware({
    app: app as any,
    path: '/graphql',
    cors: false
  });

  return app;
}

// Configure proxy routes
services.forEach(service => {
  service.routes.forEach(route => {
    const middleware = [];

    if (route.rateLimit) {
      middleware.push(rateLimit({
        windowMs: route.rateLimit.windowMs,
        max: route.rateLimit.max
      }));
    }

    if (route.auth) {
      middleware.push(authMiddleware);
      if (route.roles) {
        middleware.push(requireRole(route.roles));
      }
    }

    const proxy = createProxyMiddleware({
      target: service.url,
      changeOrigin: true,
      pathRewrite: {
        [`^${route.path}`]: route.path.replace('*', '')
      },
      onError: (err: Error, req: express.Request, res: express.Response) => {
        logger.error(`Proxy error: ${err.message}`, {
          service: service.name,
          path: req.path,
          error: err
        });
        res.status(500).json({ message: 'Service temporarily unavailable' });
      }
    });

    app.use(
      route.path,
      ...middleware,
      (req: AuthenticatedRequest, _res, next) => {
        logger.info(`Incoming request`, {
          service: service.name,
          path: req.path,
          method: req.method,
          userId: req.user?.id
        });
        next();
      },
      proxy
    );
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start Apollo Server and Express
startApolloServer()
  .then(app => {
    app.listen(PORT, () => {
      logger.info(`Gateway running on port ${PORT}`);
      logger.info(`Apollo Sandbox available at http://localhost:${PORT}/graphql`);
    });
  })
  .catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  process.exit(0);
});

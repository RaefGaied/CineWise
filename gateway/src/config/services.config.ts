export interface ServiceConfig {
  name: string;
  url: string;
  routes: RouteConfig[];
}

export interface RouteConfig {
  path: string;
  auth?: boolean;
  roles?: string[];
  methods?: string[];
  rateLimit?: {
    windowMs: number;
    max: number;
  };
}

export const services: ServiceConfig[] = [
  {
    name: 'user-service',
    url: process.env.USER_SERVICE_URL || 'http://localhost:3003',
    routes: [
      {
        path: '/api/auth/*',
        auth: false
      },
      {
        path: '/api/users/*',
        auth: true,
        roles: ['user', 'admin'],
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100 // limit each IP to 100 requests per windowMs
        }
      }
    ]
  },
  {
    name: 'movie-service',
    url: process.env.MOVIE_SERVICE_URL || 'http://localhost:3001',
    routes: [
      {
        path: '/api/movies',
        auth: false,
        methods: ['GET']
      },
      {
        path: '/api/movies/*',
        auth: true,
        roles: ['admin'],
        methods: ['POST', 'PUT', 'DELETE']
      }
    ]
  },
  {
    name: 'recommendation-service',
    url: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:3002',
    routes: [
      {
        path: '/api/recommendations/*',
        auth: true,
        roles: ['user', 'admin'],
        rateLimit: {
          windowMs: 60 * 60 * 1000, // 1 hour
          max: 1000 // limit each IP to 1000 requests per windowMs
        }
      }
    ]
  }
]; 
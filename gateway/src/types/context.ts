export interface AuthenticatedContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
} 
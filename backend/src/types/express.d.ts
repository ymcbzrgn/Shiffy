import { Express } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        user_type: 'manager' | 'employee';
        manager_id?: string;
        username?: string;
      };
    }
  }
}

export {};

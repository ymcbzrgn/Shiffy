import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error with context (stack trace only in development)
  logger.error(`${req.method} ${req.path} - ${err.message}`, err, 'ErrorHandler');

  // Send error response (don't leak stack traces in production)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}

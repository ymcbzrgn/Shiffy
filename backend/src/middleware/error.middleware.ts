import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err);

  // Send error response
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}

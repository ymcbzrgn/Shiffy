import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env.config';
import { corsOptions } from './config/cors.config';
import { errorHandler } from './middleware/error.middleware';
import './config/supabase.config'; // Initialize Supabase connection
import routes from './routes';
import { autoScheduleService } from './services/auto-schedule.service';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  const isRunPodConfigured = config.runpod.apiUrl !== 'PLACEHOLDER';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    port: config.port,
    supabase: {
      connected: true, // Will be validated on startup
    },
    runpod: {
      configured: isRunPodConfigured,
    },
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Shiffy Backend API',
    version: '1.0.0',
    docs: 'See SHIFFY_BACKEND_DOCS.md for API documentation',
    health: '/health',
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
const HOST = '0.0.0.0'; // Listen on all network interfaces (for physical device testing)
app.listen(PORT, HOST, () => {
  logger.info('Shiffy Backend Server Started', 'Server');
  logger.info(`Port: ${PORT}, Host: ${HOST}`, 'Server');
  logger.info(`Environment: ${config.nodeEnv}`, 'Server');
  logger.debug(`Health check: http://localhost:${PORT}/health`, 'Server');
  logger.debug(`Supabase: ${config.supabase.url}`, 'Server');
  const isRunPodConfigured = config.runpod.apiUrl !== 'PLACEHOLDER';
  logger.info(`RunPod: ${isRunPodConfigured ? 'Configured' : 'Not configured'}`, 'Server');

  // Initialize and start auto-schedule service
  logger.info('Initializing Auto-Schedule Service...', 'Scheduler');
  autoScheduleService.initialize();
  autoScheduleService.start();
  logger.info('Auto-Schedule Service Started - Runs daily at 23:00', 'Scheduler');
});

export default app;

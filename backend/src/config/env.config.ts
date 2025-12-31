import dotenv from 'dotenv';
import path from 'path';

// Load .env.local file (must be before config export)
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiry: process.env.JWT_EXPIRY || '7d',
  },

  runpod: {
    apiUrl: process.env.RUNPOD_API_URL || 'PLACEHOLDER',
    apiKey: process.env.RUNPOD_API_KEY || 'PLACEHOLDER',
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  rateLimit: {
    // Rate limiting enabled by default in production for security
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
};

// Validate critical environment variables at startup
function validateEnv() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Use console directly here since logger may not be initialized yet
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Config] Environment variables validated');
  }
}

validateEnv();

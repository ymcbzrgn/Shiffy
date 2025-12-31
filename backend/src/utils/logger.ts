/**
 * Logger Utility
 *
 * Production-ready logging with environment awareness
 * Reduces noise in production while keeping debug info in development
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  isProduction: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const logLevel = (process.env.LOG_LEVEL || 'debug') as LogLevel;

    this.config = {
      level: logLevel,
      isProduction: nodeEnv === 'production',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : '';
    return `${timestamp} [${level.toUpperCase()}] ${prefix} ${message}`;
  }

  /**
   * Debug level - only in development
   */
  debug(message: string, context?: string): void {
    if (!this.config.isProduction && this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Info level - general information
   */
  info(message: string, context?: string): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context));
    }
  }

  /**
   * Warn level - warnings that don't stop execution
   */
  warn(message: string, context?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  /**
   * Error level - always logged
   */
  error(message: string, error?: Error, context?: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
      if (error && !this.config.isProduction) {
        console.error(error.stack);
      }
    }
  }

  /**
   * Auth context logging
   */
  auth(message: string): void {
    this.debug(message, 'Auth');
  }

  /**
   * API request logging
   */
  api(method: string, path: string, statusCode?: number): void {
    const status = statusCode ? ` -> ${statusCode}` : '';
    this.debug(`${method} ${path}${status}`, 'API');
  }

  /**
   * Database operation logging
   */
  db(operation: string, table: string): void {
    this.debug(`${operation} on ${table}`, 'DB');
  }
}

// Singleton instance
export const logger = new Logger();

// Named exports for convenience
export const { debug, info, warn, error } = {
  debug: (msg: string, ctx?: string) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: string) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: string) => logger.warn(msg, ctx),
  error: (msg: string, err?: Error, ctx?: string) => logger.error(msg, err, ctx),
};

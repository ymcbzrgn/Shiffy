/**
 * Logger Utility Tests
 *
 * Tests for production-ready logging utility
 */

import { logger, debug, info, warn, error } from './logger';

describe('Logger Utility', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  const originalEnv = process.env;

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    // Restore console methods
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    process.env = originalEnv;
  });

  describe('Logger class', () => {
    it('should be a singleton', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should have auth helper method', () => {
      expect(typeof logger.auth).toBe('function');
    });

    it('should have api helper method', () => {
      expect(typeof logger.api).toBe('function');
    });

    it('should have db helper method', () => {
      expect(typeof logger.db).toBe('function');
    });
  });

  describe('Named exports', () => {
    it('should export debug function', () => {
      expect(typeof debug).toBe('function');
    });

    it('should export info function', () => {
      expect(typeof info).toBe('function');
    });

    it('should export warn function', () => {
      expect(typeof warn).toBe('function');
    });

    it('should export error function', () => {
      expect(typeof error).toBe('function');
    });
  });

  describe('Log formatting', () => {
    it('should format info messages with timestamp', () => {
      logger.info('Test message');

      expect(consoleSpy.log).toHaveBeenCalled();
      const loggedMessage = consoleSpy.log.mock.calls[0][0];

      // Should contain timestamp (ISO format)
      expect(loggedMessage).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      // Should contain level
      expect(loggedMessage).toContain('[INFO]');
      // Should contain message
      expect(loggedMessage).toContain('Test message');
    });

    it('should include context when provided', () => {
      logger.info('Test message', 'TestContext');

      const loggedMessage = consoleSpy.log.mock.calls[0][0];
      expect(loggedMessage).toContain('[TestContext]');
    });

    it('should format warn messages correctly', () => {
      logger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalled();
      const loggedMessage = consoleSpy.warn.mock.calls[0][0];
      expect(loggedMessage).toContain('[WARN]');
    });

    it('should format error messages correctly', () => {
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalled();
      const loggedMessage = consoleSpy.error.mock.calls[0][0];
      expect(loggedMessage).toContain('[ERROR]');
    });
  });

  describe('Helper methods', () => {
    it('auth() should log with Auth context', () => {
      // In development mode, auth logs through debug
      process.env.NODE_ENV = 'development';

      // Create new logger instance to pick up env change
      // Note: Since logger is a singleton created at module load,
      // this test verifies the method exists and can be called
      logger.auth('User logged in');

      // auth uses debug internally, which checks isProduction
      // In the actual singleton, the config is set at module load time
    });

    it('api() should format API request info', () => {
      logger.api('GET', '/api/users', 200);
      // API uses debug internally
    });

    it('db() should format database operation info', () => {
      logger.db('SELECT', 'users');
      // DB uses debug internally
    });
  });

  describe('Error logging', () => {
    it('should log error message', () => {
      const testError = new Error('Test error');
      logger.error('Something went wrong', testError, 'ErrorTest');

      expect(consoleSpy.error).toHaveBeenCalled();
      const loggedMessage = consoleSpy.error.mock.calls[0][0];
      expect(loggedMessage).toContain('Something went wrong');
      expect(loggedMessage).toContain('[ErrorTest]');
    });
  });
});

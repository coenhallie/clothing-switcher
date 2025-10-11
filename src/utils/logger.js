/**
 * Environment-aware logging utility
 * Provides debug logging in development, minimal logging in production
 * Prevents sensitive data leakage and improves performance
 */

import { LOG_LEVELS } from '../constants/index.js';

// Determine current environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get log level from environment or default to INFO in dev, ERROR in prod
const DEFAULT_LOG_LEVEL = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

class Logger {
  constructor(level = DEFAULT_LOG_LEVEL) {
    this.level = level;
    this.enabled = true;
  }

  /**
   * Set logging level
   * @param {number} level - One of LOG_LEVELS (ERROR, WARN, INFO, DEBUG)
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Enable or disable all logging
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Sanitize data to remove sensitive information
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  _sanitize(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    const sensitiveKeys = [
      'password',
      'token',
      'access_token',
      'refresh_token',
      'apiKey',
      'secret',
      'auth',
      'authorization',
      'cookie',
    ];

    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const result = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
        
        if (isSensitive) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Format log prefix with context
   * @param {string} context - Context identifier (e.g., 'AuthStore', 'App')
   * @returns {string} Formatted prefix
   */
  _formatPrefix(context) {
    if (!context) return '';
    return `[${context}]`;
  }

  /**
   * Internal logging method
   * @param {number} level - Log level
   * @param {string} method - Console method to use
   * @param {string} context - Context identifier
   * @param {Array} args - Arguments to log
   */
  _log(level, method, context, ...args) {
    if (!this.enabled || level > this.level) {
      return;
    }

    // In production, only log errors and warnings
    if (isProduction && level > LOG_LEVELS.WARN) {
      return;
    }

    const prefix = this._formatPrefix(context);
    const sanitizedArgs = args.map(arg => this._sanitize(arg));
    
    console[method](prefix, ...sanitizedArgs);
  }

  /**
   * Log error message
   * @param {string} context - Context identifier
   * @param {...any} args - Arguments to log
   */
  error(context, ...args) {
    this._log(LOG_LEVELS.ERROR, 'error', context, ...args);
  }

  /**
   * Log warning message
   * @param {string} context - Context identifier
   * @param {...any} args - Arguments to log
   */
  warn(context, ...args) {
    this._log(LOG_LEVELS.WARN, 'warn', context, ...args);
  }

  /**
   * Log info message
   * @param {string} context - Context identifier
   * @param {...any} args - Arguments to log
   */
  info(context, ...args) {
    this._log(LOG_LEVELS.INFO, 'log', context, ...args);
  }

  /**
   * Log debug message
   * @param {string} context - Context identifier
   * @param {...any} args - Arguments to log
   */
  debug(context, ...args) {
    this._log(LOG_LEVELS.DEBUG, 'log', context, ...args);
  }

  /**
   * Create a scoped logger for a specific context
   * @param {string} context - Context identifier
   * @returns {Object} Scoped logger
   */
  createScoped(context) {
    return {
      error: (...args) => this.error(context, ...args),
      warn: (...args) => this.warn(context, ...args),
      info: (...args) => this.info(context, ...args),
      debug: (...args) => this.debug(context, ...args),
    };
  }
}

// Create and export singleton instance
const logger = new Logger();

// Export both the instance and the class
export default logger;
export { Logger };

// Convenience function to create scoped loggers
export const createLogger = (context) => logger.createScoped(context);
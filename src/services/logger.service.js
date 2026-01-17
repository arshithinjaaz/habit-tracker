/**
 * Logging service for monitoring and debugging
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * Logger class for structured logging
 */
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 logs in memory
  }

  /**
   * Format log message
   * @private
   */
  _formatMessage(level, message, data) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Store log in memory
   * @private
   */
  _storeLog(logEntry) {
    this.logs.push(logEntry);
    
    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Log debug message (only in development)
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  debug(message, data = null) {
    if (!this.isDevelopment) return;
    
    const logEntry = this._formatMessage(LOG_LEVELS.DEBUG, message, data);
    this._storeLog(logEntry);
    console.debug(`[DEBUG] ${message}`, data || '');
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  info(message, data = null) {
    const logEntry = this._formatMessage(LOG_LEVELS.INFO, message, data);
    this._storeLog(logEntry);
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  warn(message, data = null) {
    const logEntry = this._formatMessage(LOG_LEVELS.WARN, message, data);
    this._storeLog(logEntry);
    console.warn(`[WARN] ${message}`, data || '');
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Error|any} error - Error object or additional data
   */
  error(message, error = null) {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

    const logEntry = this._formatMessage(LOG_LEVELS.ERROR, message, errorData);
    this._storeLog(logEntry);
    console.error(`[ERROR] ${message}`, errorData || '');
    
    // In production, you could send this to an error tracking service
    // this._sendToErrorService(logEntry);
  }

  /**
   * Log analytics event
   * @param {string} eventName - Event name
   * @param {Object} eventData - Event data
   */
  event(eventName, eventData = {}) {
    const logEntry = this._formatMessage('event', eventName, eventData);
    this._storeLog(logEntry);
    
    if (this.isDevelopment) {
      console.log(`[EVENT] ${eventName}`, eventData);
    }
    
    // In production, send to analytics service
    // this._sendToAnalytics(eventName, eventData);
  }

  /**
   * Get all logs
   * @returns {Array} - Array of log entries
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Get logs by level
   * @param {string} level - Log level
   * @returns {Array} - Filtered log entries
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   * @returns {string} - JSON string of logs
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Send error to external service (placeholder)
   * @private
   */
  _sendToErrorService(logEntry) {
    // Placeholder for Sentry or similar service
    // Sentry.captureException(logEntry);
  }

  /**
   * Send analytics event to external service (placeholder)
   * @private
   */
  _sendToAnalytics(eventName, eventData) {
    // Placeholder for Google Analytics or similar
    // gtag('event', eventName, eventData);
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Log habit action
 * @param {string} action - Action name (e.g., 'completed', 'uncompleted')
 * @param {Object} habitData - Habit data
 */
export const logHabitAction = (action, habitData) => {
  logger.event('habit_action', {
    action,
    habitId: habitData.id,
    habitLabel: habitData.label,
    category: habitData.category,
  });
};

/**
 * Log memory action
 * @param {string} action - Action name (e.g., 'created', 'deleted')
 * @param {Object} memoryData - Memory data
 */
export const logMemoryAction = (action, memoryData) => {
  logger.event('memory_action', {
    action,
    memoryId: memoryData.id,
    textLength: memoryData.text?.length || 0,
  });
};

/**
 * Log user action
 * @param {string} action - Action name (e.g., 'login', 'logout')
 * @param {Object} userData - User data
 */
export const logUserAction = (action, userData) => {
  logger.event('user_action', {
    action,
    userName: userData.userName,
  });
};

/**
 * Log performance metric
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 */
export const logPerformance = (metric, value) => {
  logger.event('performance', {
    metric,
    value,
    timestamp: Date.now(),
  });
};

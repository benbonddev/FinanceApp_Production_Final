/**
 * Logger utility for handling console logs in a production-safe way
 * In production, errors are logged but other levels are suppressed
 */

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger utility that handles console logs in a production-safe way
 */
export const logger = {
  /**
   * Log error messages - these are kept even in production for critical issues
   * @param message - The error message
   * @param optionalParams - Additional parameters
   */
  error: (message: string, ...optionalParams: any[]) => {
    // Always log errors, even in production
    console.error(message, ...optionalParams);
  },

  /**
   * Log warning messages - suppressed in production
   * @param message - The warning message
   * @param optionalParams - Additional parameters
   */
  warn: (message: string, ...optionalParams: any[]) => {
    if (!isProduction) {
      console.warn(message, ...optionalParams);
    }
  },

  /**
   * Log info messages - suppressed in production
   * @param message - The info message
   * @param optionalParams - Additional parameters
   */
  info: (message: string, ...optionalParams: any[]) => {
    if (!isProduction) {
      console.info(message, ...optionalParams);
    }
  },

  /**
   * Log debug messages - suppressed in production
   * @param message - The debug message
   * @param optionalParams - Additional parameters
   */
  debug: (message: string, ...optionalParams: any[]) => {
    if (!isProduction) {
      console.debug(message, ...optionalParams);
    }
  },
};

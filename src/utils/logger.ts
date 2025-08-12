import { environment } from '../config/environment';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Logger utility class
export class Logger {
  private static isDevelopment = environment.app.environment === 'development';

  // Log with timestamp and level
  private static log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      environment: environment.app.environment,
      ...(data && { data }),
    };

    // Only log in development or if it's an error
    if (this.isDevelopment || level === LogLevel.ERROR) {
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  // Debug logging (only in development)
  static debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  // Info logging
  static info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  // Warning logging
  static warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  // Error logging
  static error(message: string, error?: any) {
    this.log(LogLevel.ERROR, message, error);
  }

  // API request logging
  static logApiRequest(method: string, url: string, data?: any) {
    this.info(`API Request: ${method} ${url}`, data);
  }

  // API response logging
  static logApiResponse(method: string, url: string, status: number, data?: any) {
    this.info(`API Response: ${method} ${url} (${status})`, data);
  }

  // API error logging
  static logApiError(method: string, url: string, error: any) {
    this.error(`API Error: ${method} ${url}`, error);
  }

  // User action logging
  static logUserAction(action: string, data?: any) {
    this.info(`User Action: ${action}`, data);
  }

  // Performance logging
  static logPerformance(operation: string, duration: number) {
    this.info(`Performance: ${operation} took ${duration}ms`);
  }
}



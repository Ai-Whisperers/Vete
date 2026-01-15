/**
 * @deprecated This logger is deprecated. Use @/lib/logger instead.
 *
 * The main logger at @/lib/logger provides:
 * - Structured JSON logging in production
 * - Pretty console output in development
 * - Request context (requestId, tenant, user)
 * - createRequestLogger() for request-scoped logging
 * - withTiming() for performance measurement
 * - logQuery() for database query logging
 *
 * Example:
 *   import { logger, createRequestLogger } from '@/lib/logger'
 *   logger.info('Server started', { port: 3000 })
 *
 * This file will be removed in a future version.
 */

import { ErrorContext } from '@/lib/errors'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

export interface LogContext {
  userId?: string
  tenantId?: string
  requestId?: string
  sessionId?: string
  operation?: string
  resource?: string
  duration?: number
  metadata?: Record<string, unknown>
  error?: Error
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private context: LogContext = {}

  /**
   * Set global context for all subsequent logs
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {}
  }

  /**
   * Create a child logger with additional context
   */
  child(extraContext: Partial<LogContext>): Logger {
    const child = new Logger()
    child.context = { ...this.context, ...extraContext }
    return child
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Partial<LogContext>): void {
    this.log('debug', message, context)
  }

  /**
   * Log info message
   */
  info(message: string, context?: Partial<LogContext>): void {
    this.log('info', message, context)
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Partial<LogContext>): void {
    this.log('warn', message, context)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Partial<LogContext>): void {
    this.log('error', message, { ...context, error })
  }

  /**
   * Log critical message
   */
  critical(message: string, error?: Error, context?: Partial<LogContext>): void {
    this.log('critical', message, { ...context, error })
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, context?: Partial<LogContext>): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      operation,
      duration,
    })
  }

  /**
   * Log security events
   */
  security(event: string, context?: Partial<LogContext>): void {
    this.warn(`Security: ${event}`, {
      ...context,
      operation: 'security_event',
    })
  }

  /**
   * Log business events
   */
  business(event: string, context?: Partial<LogContext>): void {
    this.info(`Business: ${event}`, {
      ...context,
      operation: 'business_event',
    })
  }

  private log(level: LogLevel, message: string, context?: Partial<LogContext>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    }

    // Add error details if present
    if (context?.error instanceof Error) {
      entry.error = {
        name: context.error.name,
        message: context.error.message,
        stack: context.error.stack,
      }
    }

    // In development, also log to console with appropriate level
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(entry)
    }

    // TODO: Send to external logging service (e.g., DataDog, LogRocket, etc.)
    this.sendToExternalService(entry)
  }

  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}:`
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''

    switch (entry.level) {
      case 'debug':
        console.debug(prefix, entry.message + contextStr)
        break
      case 'info':
        console.info(prefix, entry.message + contextStr)
        break
      case 'warn':
        console.warn(prefix, entry.message + contextStr)
        break
      case 'error':
      case 'critical':
        console.error(prefix, entry.message + contextStr)
        if (entry.error?.stack) {
          console.error(entry.error.stack)
        }
        break
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // Examples:
    // - Send to DataDog
    // - Send to LogRocket
    // - Send to Sentry
    // - Send to custom logging API

    // For now, just store in memory for development
    if (process.env.NODE_ENV === 'development') {
      // Could store in a global array for debugging
      interface GlobalWithLogs {
        __logs?: LogEntry[]
      }
      const globalWithLogs = globalThis as GlobalWithLogs
      globalWithLogs.__logs = globalWithLogs.__logs || []
      globalWithLogs.__logs.push(entry)
    }
  }
}

// Global logger instance
export const logger = new Logger()

// Helper function to create request-scoped logger
export function createRequestLogger(context: ErrorContext): Logger {
  return logger.child({
    requestId: context.requestId,
    userId: context.userId,
    tenantId: context.tenantId,
  })
}

// Helper function to log API requests
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  context?: LogContext
): void {
  const message = `API ${method} ${path} - ${statusCode}`
  const logContext = {
    ...context,
    operation: 'api_request',
    duration,
    metadata: { method, path, statusCode },
  }

  if (statusCode >= 500) {
    logger.error(message, undefined, logContext)
  } else if (statusCode >= 400) {
    logger.warn(message, logContext)
  } else {
    logger.info(message, logContext)
  }
}

// Helper function to log database operations
export function logDatabaseOperation(
  operation: string,
  table: string,
  duration: number,
  success: boolean,
  context?: LogContext
): void {
  const message = `DB ${operation} on ${table}`
  const logContext = {
    ...context,
    operation: 'database_operation',
    duration,
    metadata: { operation, table, success },
  }

  if (success) {
    logger.debug(message, logContext)
  } else {
    logger.error(message, undefined, logContext)
  }
}

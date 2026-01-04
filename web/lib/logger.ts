/**
 * Centralized Logger for Vete
 *
 * Features:
 * - Structured JSON logging in production
 * - Pretty console output in development
 * - Request context (request ID, tenant, user)
 * - Debug mode via LOG_LEVEL env var
 * - Automatic error serialization
 *
 * Usage:
 *   import { logger, createRequestLogger } from '@/lib/logger'
 *
 *   // Simple logging
 *   logger.info('Server started', { port: 3000 })
 *   logger.error('Failed to fetch', { error })
 *
 *   // Request-scoped logging (in API routes)
 *   const log = createRequestLogger(request, { tenant: 'adris' })
 *   log.info('Processing request')
 *   log.debug('Query params', { params })
 *
 * Environment:
 *   LOG_LEVEL=debug|info|warn|error (default: info in prod, debug in dev)
 *   LOG_FORMAT=json|pretty (default: json in prod, pretty in dev)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  requestId?: string
  tenant?: string
  userId?: string
  method?: string
  path?: string
  duration?: number
  [key: string]: unknown
}

interface LogEntry {
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

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
}

const RESET = '\x1b[0m'
const DIM = '\x1b[2m'
const BOLD = '\x1b[1m'

function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function isJsonFormat(): boolean {
  if (process.env.LOG_FORMAT === 'json') return true
  if (process.env.LOG_FORMAT === 'pretty') return false
  return process.env.NODE_ENV === 'production'
}

function serializeError(error: unknown): LogEntry['error'] | undefined {
  if (!error) return undefined

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  if (typeof error === 'string') {
    return { name: 'Error', message: error }
  }

  return { name: 'Error', message: String(error) }
}

function formatPretty(entry: LogEntry): string {
  const { timestamp, level, message, context, error } = entry
  const color = LEVEL_COLORS[level]
  const time = new Date(timestamp).toLocaleTimeString()

  let output = `${DIM}${time}${RESET} ${color}${BOLD}${level.toUpperCase().padEnd(5)}${RESET} ${message}`

  // Add context inline if present
  if (context) {
    const { requestId, tenant, userId, method, path, duration, ...rest } = context
    const parts: string[] = []

    if (requestId) parts.push(`req=${requestId.slice(0, 8)}`)
    if (tenant) parts.push(`tenant=${tenant}`)
    if (userId) parts.push(`user=${userId.slice(0, 8)}`)
    if (method && path) parts.push(`${method} ${path}`)
    if (duration !== undefined) parts.push(`${duration}ms`)

    if (parts.length > 0) {
      output += ` ${DIM}[${parts.join(' | ')}]${RESET}`
    }

    // Additional context as JSON
    if (Object.keys(rest).length > 0) {
      output += `\n  ${DIM}${JSON.stringify(rest)}${RESET}`
    }
  }

  // Error details
  if (error) {
    output += `\n  ${color}${error.name}: ${error.message}${RESET}`
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(1, 4)
      output += `\n${DIM}${stackLines.join('\n')}${RESET}`
    }
  }

  return output
}

function formatJson(entry: LogEntry): string {
  return JSON.stringify(entry)
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getLogLevel()]
}

function log(
  level: LogLevel,
  message: string,
  contextOrError?: LogContext | Error | unknown
): void {
  if (!shouldLog(level)) return

  let context: LogContext | undefined
  let error: LogEntry['error'] | undefined

  if (contextOrError instanceof Error) {
    error = serializeError(contextOrError)
  } else if (contextOrError && typeof contextOrError === 'object') {
    const { error: ctxError, ...rest } = contextOrError as LogContext & { error?: unknown }
    context = Object.keys(rest).length > 0 ? rest : undefined
    error = serializeError(ctxError)
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  }

  const output = isJsonFormat() ? formatJson(entry) : formatPretty(entry)

  switch (level) {
    case 'error':
      console.error(output)
      break
    case 'warn':
      console.warn(output)
      break
    default:
      console.log(output)
  }
}

/**
 * Global logger instance
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, contextOrError?: LogContext | Error) =>
    log('error', message, contextOrError),
}

/**
 * Create a request-scoped logger with automatic context
 */
export function createRequestLogger(
  request: Request,
  additionalContext?: Partial<LogContext>
): typeof logger {
  const url = new URL(request.url)
  const requestId = crypto.randomUUID()

  const baseContext: LogContext = {
    requestId,
    method: request.method,
    path: url.pathname,
    ...additionalContext,
  }

  return {
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, { ...baseContext, ...context }),
    error: (message: string, contextOrError?: LogContext | Error) => {
      if (contextOrError instanceof Error) {
        log('error', message, { ...baseContext, error: contextOrError })
      } else {
        log('error', message, { ...baseContext, ...contextOrError })
      }
    },
  }
}

/**
 * Measure and log execution time
 */
export function withTiming<T>(
  operation: string,
  fn: () => Promise<T>,
  log: typeof logger = logger
): Promise<T> {
  const start = performance.now()
  return fn().finally(() => {
    const duration = Math.round(performance.now() - start)
    log.debug(`${operation} completed`, { duration })
  })
}

/**
 * Log database query (for debugging slow queries)
 */
export function logQuery(
  table: string,
  operation: string,
  duration: number,
  rowCount?: number
): void {
  const level: LogLevel = duration > 1000 ? 'warn' : duration > 200 ? 'info' : 'debug'
  logger[level](`DB ${operation} ${table}`, {
    duration,
    rows: rowCount,
    slow: duration > 1000,
  })
}

export type { LogLevel, LogContext }

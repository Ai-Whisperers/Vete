import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { Sentry } from '@sentry/nextjs'

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LEVEL_COLORS = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
}

const RESET = '\x1b[0m'
const DIM = '\x1b[2m'
const BOLD = '\x1b[1m'

let logLevel: keyof typeof LOG_LEVELS = 'info'

if (process.env.LOG_LEVEL) {
  logLevel = process.env.LOG_LEVEL as keyof typeof LOG_LEVELS
}

const isJsonFormat = process.env.LOG_FORMAT === 'json' || process.env.NODE_ENV === 'production'

class Logger {
  private context: any = {}

  setContext(context: any) {
    this.context = { ...this.context, ...context }
  }

  clearContext() {
    this.context = {}
  }

  child(extraContext: any) {
    const child = new Logger()
    child.context = { ...this.context, ...extraContext }
    return child
  }

  debug(message: string, context?: any) {
    this.log('debug', message, context)
  }

  info(message: string, context?: any) {
    this.log('info', message, context)
  }

  warn(message: string, context?: any) {
    this.log('warn', message, context)
  }

  error(message: string, error?: any, context?: any) {
    this.log('error', message, { ...context, error })
  }

  private log(level: keyof typeof LOG_LEVELS, message: string, context?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    }

    if (isJsonFormat) {
      console.log(JSON.stringify(entry))
    } else {
      const color = LEVEL_COLORS[level]
      const time = new Date(entry.timestamp).toLocaleTimeString()
      console.log(`${DIM}${time}${RESET} ${color}${BOLD}${level.toUpperCase().padEnd(5)}${RESET} ${message}`)
    }

    if (level === 'error' && Sentry) {
      Sentry.captureException(new Error(message))
    }
  }
}

export const logger = new Logger()
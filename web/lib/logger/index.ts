/**
 * Logger Module Exports
 */
export * from '../logger'
export {
  logApiError,
  logApiWarn,
  logApiInfo,
  logRpcFallback,
  type ApiLogContext,
} from './api-helpers'

import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { sentryTransport } from '@sentry/nextjs';

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
    new transports.DailyRotateFile({
      filename: './logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    sentryTransport({
      level: 'error',
    }),
  ],
});

export { logger };
/**
 * API Logging Helpers
 *
 * Standardized logging utilities for API routes to reduce boilerplate
 * and ensure consistent error tracking across the codebase.
 */

import { logger } from './index';

export interface ApiLogContext {
  tenantId?: string;
  userId?: string;
  resourceId?: string;
  [key: string]: unknown;
}

export function logApiError(
  module: string,
  message: string,
  context: ApiLogContext,
  error: unknown
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`[API/${module}] ${message}`, {
    ...context,
    error: errorMessage,
    action: `api.${module}.error`,
  });
}

export function logApiWarn(
  module: string,
  message: string,
  context: ApiLogContext
): void {
  logger.warn(`[API/${module}] ${message}`, context);
}

export function logApiInfo(
  module: string,
  message: string,
  context: ApiLogContext
): void {
  logger.info(`[API/${module}] ${message}`, context);
}

export function logRpcFallback(
  module: string,
  message: string,
  context: ApiLogContext
): void {
  logger.info(`[RPC/${module}] ${message}`, context);
}
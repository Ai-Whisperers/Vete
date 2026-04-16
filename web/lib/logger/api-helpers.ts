import { logger } from './logger'

export interface ApiLogContext {
  userId?: string
  tenantId?: string
  requestId?: string
  sessionId?: string
  operation?: string
  resource?: string
  duration?: number
  metadata?: any
  error?: any
}

export function logApiError(module: string, message: string, context: ApiLogContext, error: any) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  logger.error(`[API/${module}] ${message}`, {
    ...context,
    error: errorMessage,
    action: `api.${module}.error`,
  })
}

export function logApiWarn(module: string, message: string, context: ApiLogContext = {}) {
  logger.warn(`[API/${module}] ${message}`, {
    ...context,
    action: `api.${module}.warn`,
  })
}

export function logApiInfo(module: string, message: string, context: ApiLogContext = {}) {
  logger.info(`[API/${module}] ${message}`, {
    ...context,
    action: `api.${module}.info`,
  })
}

export function logRpcFallback(module: string, rpcName: string, context: ApiLogContext = {}) {
  logger.warn(`[API/${module}] RPC ${rpcName} not found - using fallback`, {
    ...context,
    rpcName,
    action: `api.${module}.rpc_fallback`,
  })
}
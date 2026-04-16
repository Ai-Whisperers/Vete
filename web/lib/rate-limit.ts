import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

/**
 * Rate limit configuration for different endpoint types
 */
export const RATE_LIMITS = {
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Demasiadas solicitudes. Intente de nuevo en',
  },
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Demasiadas búsquedas. Intente de nuevo en',
  },
  write: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Demasiadas solicitudes. Intente de nuevo en',
  },
  // Stricter limit for sensitive financial operations
  financial: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Demasiadas operaciones financieras. Intente de nuevo en',
  },
  // Very strict limit for refunds (potential fraud prevention)
  refund: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    message: 'Límite de reembolsos alcanzado. Intente de nuevo en',
  },
  // Strict limit for checkout operations
  checkout: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Demasiados intentos de pago. Intente de nuevo en',
  },
  // SEC-026: Cart operations (higher limit for frequent syncs)
  cart: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // Allow frequent cart updates
    message: 'Demasiadas operaciones de carrito. Intente de nuevo en',
  },
  // SEC-027: Booking request rate limit
  booking: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 bookings per hour is generous
    message: 'Demasiadas solicitudes de reserva. Intente de nuevo en',
  },
  // SEC-028: GDPR verification rate limit (Epic 4.1)
  gdpr: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 attempts per token per hour (prevents brute-force)
    message: 'Demasiados intentos de verificación. Intente de nuevo en',
  },
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Demasiadas solicitudes. Intente de nuevo en',
  },
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

/**
 * Request record with timestamps
 */
interface RequestRecord {
  timestamps: number[]
}

/**
 * In-memory store for rate limiting
 * Maps identifier (IP or user ID) to request timestamps
 */
class RateLimitStore {
  private store: Map<string, RequestRecord> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000
    )
  }

  /**
   * Get request timestamps for an identifier
   */
  get(identifier: string): number[] {
    return this.store.get(identifier)?.timestamps || []
  }

  /**
   * Add a new request timestamp for an identifier
   */
  add(identifier: string, timestamp: number): void {
    const record = this.store.get(identifier) || { timestamps: [] }
    record.timestamps.push(timestamp)
    this.store.set(identifier, record)
  }

  /**
   * Remove old timestamps outside the window
   */
  prune(identifier: string, windowStart: number): void {
    const record = this.store.get(identifier)
    if (!record) return

    record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

    if (record.timestamps.length === 0) {
      this.store.delete(identifier)
    } else {
      this.store.set(identifier, record)
    }
  }

  /**
   * Clean up old entries (older than 10 minutes)
   */
  private cleanup(): void {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000

    const entriesToDelete: string[] = []

    this.store.forEach((record, identifier) => {
      record.timestamps = record.timestamps.filter((ts) => ts > tenMinutesAgo)

      if (record.timestamps.length === 0) {
        entriesToDelete.push(identifier)
      }
    })

    entriesToDelete.forEach((id) => this.store.delete(id))
  }
}

const inMemoryStore = new RateLimitStore()

/**
 * Check rate limit for an identifier
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'default'
): Promise<{
  isLimited: boolean
  retryAfter: number
}> {
  const config = RATE_LIMITS[type]
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get existing timestamps
  const timestamps = inMemoryStore.get(identifier)

  // Prune old timestamps
  inMemoryStore.prune(identifier, windowStart)

  // Check if limit exceeded
  if (timestamps.length >= config.maxRequests) {
    const oldestTimestamp = Math.min(...timestamps)
    const retryAfterMs = oldestTimestamp + config.windowMs - now
    const retryAfter = Math.ceil(retryAfterMs / 1000)

    return {
      isLimited: true,
      retryAfter,
    }
  }

  // Add current request timestamp
  inMemoryStore.add(identifier, now)

  return {
    isLimited: false,
    retryAfter: 0,
  }
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearRateLimits(): void {
  inMemoryStore.store.clear()
}

/**
 * Cleanup resources on shutdown
 */
export function shutdown(): void {
  inMemoryStore.cleanupInterval && clearInterval(inMemoryStore.cleanupInterval)
}
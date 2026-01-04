/**
 * Rate limiting middleware
 * Prevents abuse by limiting request frequency
 */

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'

// Rate limiters for different endpoints
const authLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '10 m'), // 5 requests per 10 minutes
  analytics: true,
  prefix: 'ratelimit:auth',
})

const apiLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:api',
})

const bookingLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 bookings per hour
  analytics: true,
  prefix: 'ratelimit:booking',
})

export interface RateLimitOptions {
  limiter?: Ratelimit
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export function withRateLimit(options: RateLimitOptions = {}) {
  const {
    limiter = apiLimiter,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options

  return async function middleware(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1'

    try {
      const { success, limit, reset, remaining } = await limiter.limit(ip)

      // Add rate limit headers
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', reset.toString())

      if (!success) {
        response.headers.set('Retry-After', reset.toString())
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: response.headers,
        })
      }

      return response
    } catch (error) {
      console.error('Rate limit error:', error)
      // On rate limit service error, allow the request
      return NextResponse.next()
    }
  }
}

// Pre-configured middleware for different use cases
export const authRateLimit = withRateLimit({ limiter: authLimiter })
export const apiRateLimit = withRateLimit({ limiter: apiLimiter })
export const bookingRateLimit = withRateLimit({ limiter: bookingLimiter })

// Utility function to get appropriate limiter based on path
export function getRateLimiter(pathname: string): Ratelimit {
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/auth')) {
    return authLimiter
  }
  if (pathname.startsWith('/api/book') || pathname.startsWith('/book')) {
    return bookingLimiter
  }
  return apiLimiter
}

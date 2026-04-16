import { NextResponse } from 'next/server'
import { withRateLimit } from '../../lib/middleware/rate-limit'

export async function POST(request: Request) {
  // Rate limiting for contact form submission
  const rateLimitResult = await withRateLimit({
    limiter: getRateLimiter('/api/contact'),
  })(request)

  if (!rateLimitResult.success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: rateLimitResult.headers,
    })
  }

  // Process contact form submission
  // ...
}
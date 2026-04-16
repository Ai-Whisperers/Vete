import { NextResponse } from 'next/server'
import { withRateLimit } from '../../lib/middleware/rate-limit'

export async function GET(request: Request) {
  // No rate limiting for health check
  return new NextResponse('OK', { status: 200 })
}
import { NextResponse } from 'next/server'
import { swrConfig } from '../utils/swr'

/**
 * Add SWR caching headers to API responses
 */
export function withSwrCache(fn: (req: Request) => Promise<NextResponse>) {
  return async (req: Request) => {
    const response = await fn(req)
    response.headers.set('Cache-Control', 'public, max-age=3600')
    response.headers.set('SWR-Config', JSON.stringify(swrConfig))
    return response
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

interface WebVitalsPayload {
  name: string
  value: number
  id: string
  url: string
  userAgent: string
  timestamp: number
  rating?: 'good' | 'needs-improvement' | 'poor'
}

/**
 * Analytics endpoint for Web Vitals collection
 * Receives performance metrics from client-side and logs them
 */
export async function POST(request: NextRequest) {
  try {
    const data: WebVitalsPayload = await request.json()
    
    // Validate the payload
    if (!data.name || typeof data.value !== 'number' || !data.id) {
      return NextResponse.json(
        { error: 'Invalid web vitals data' },
        { status: 400 }
      )
    }

    // Extract useful information
    const { name, value, id, url, userAgent, timestamp, rating } = data
    
    // Log the metric (this could be sent to a proper analytics service)
    logger.info('Web Vitals metric collected', {
      metric: name,
      value,
      rating,
      url,
      timestamp,
      id,
      userAgent: userAgent ? userAgent.substring(0, 100) : undefined, // Truncate UA string
    })

    // Here you could also:
    // - Send to a time-series database (InfluxDB, CloudWatch, etc.)
    // - Send to a custom analytics service
    // - Store in your main database for dashboard queries
    // - Send to third-party services (DataDog, New Relic, etc.)

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    logger.error('Failed to process web vitals data', { error })
    
    // Don't return error details to client - just log internally
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle preflight requests for CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
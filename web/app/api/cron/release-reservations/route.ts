import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/release-reservations
 *
 * Cron job to release expired stock reservations.
 * Should be called every 5-10 minutes.
 * Configure in vercel.json crons with schedule: "0/5 * * * *"
 */
export async function GET(request: Request) {
  // Verify cron secret - CRITICAL: fail closed if not configured
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    logger.error('CRON_SECRET not configured for release-reservations - blocking request')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron attempt for release-reservations')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const startTime = Date.now()

  try {
    // Call the RPC function to release expired reservations
    const { data: result, error } = await supabase.rpc('release_expired_reservations')

    if (error) {
      logger.error('Error releasing expired reservations', { error })
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime

    logger.info('Released expired reservations', {
      releasedCount: result?.released_count || 0,
      durationMs: duration,
    })

    return NextResponse.json({
      success: true,
      released_count: result?.released_count || 0,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Exception in release-reservations cron', { error: error.message })

    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * Cron Health Check Endpoint
 *
 * AUDIT-002: GET /api/health/cron
 *
 * Returns health status of cron jobs based on expected run intervals.
 * Can be used for external monitoring and alerting.
 */

import { NextResponse } from 'next/server'
import { getCronJobStatus } from '@/lib/services/cron-tracker'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// =============================================================================
// Cron Job Definitions
// =============================================================================

interface CronJobDefinition {
  name: string
  description: string
  /** Expected interval in minutes */
  expectedIntervalMinutes: number
  /** Grace period before marking as unhealthy (in minutes) */
  gracePeriodMinutes: number
  /** Whether this is a critical job */
  critical: boolean
}

const CRON_JOBS: CronJobDefinition[] = [
  {
    name: 'release-reservations',
    description: 'Release expired cart stock reservations',
    expectedIntervalMinutes: 5,
    gracePeriodMinutes: 15,
    critical: true,
  },
  {
    name: 'process-subscriptions',
    description: 'Process recurring subscription renewals',
    expectedIntervalMinutes: 60,
    gracePeriodMinutes: 120,
    critical: true,
  },
  {
    name: 'expiry-alerts',
    description: 'Send product expiry notifications',
    expectedIntervalMinutes: 1440, // 24 hours
    gracePeriodMinutes: 2880, // 48 hours
    critical: false,
  },
  {
    name: 'stock-alerts',
    description: 'Send low stock email alerts',
    expectedIntervalMinutes: 60,
    gracePeriodMinutes: 180,
    critical: false,
  },
  {
    name: 'reminders',
    description: 'Process scheduled appointment/vaccine reminders',
    expectedIntervalMinutes: 60,
    gracePeriodMinutes: 180,
    critical: false,
  },
]

// =============================================================================
// Health Check Logic
// =============================================================================

interface JobHealth {
  name: string
  description: string
  healthy: boolean
  lastRun?: string
  nextExpectedRun?: string
  status: 'ok' | 'warning' | 'critical' | 'unknown'
  message: string
}

/**
 * Check health of a cron job based on last execution time
 * Note: This is a simplified check - in production, you'd track runs in a table
 */
function checkJobHealth(
  jobDef: CronJobDefinition,
  lastRunTime?: Date | null
): JobHealth {
  const now = new Date()

  if (!lastRunTime) {
    return {
      name: jobDef.name,
      description: jobDef.description,
      healthy: false,
      status: 'unknown',
      message: 'No se ha registrado ninguna ejecución',
    }
  }

  const minutesSinceLastRun = (now.getTime() - lastRunTime.getTime()) / (1000 * 60)
  const expectedNextRun = new Date(
    lastRunTime.getTime() + jobDef.expectedIntervalMinutes * 60 * 1000
  )
  const overdueMinutes = (now.getTime() - expectedNextRun.getTime()) / (1000 * 60)

  // Within expected interval
  if (minutesSinceLastRun <= jobDef.expectedIntervalMinutes) {
    return {
      name: jobDef.name,
      description: jobDef.description,
      healthy: true,
      lastRun: lastRunTime.toISOString(),
      nextExpectedRun: expectedNextRun.toISOString(),
      status: 'ok',
      message: `Ejecutado hace ${Math.round(minutesSinceLastRun)} minutos`,
    }
  }

  // Within grace period
  if (overdueMinutes <= jobDef.gracePeriodMinutes) {
    return {
      name: jobDef.name,
      description: jobDef.description,
      healthy: true,
      lastRun: lastRunTime.toISOString(),
      nextExpectedRun: expectedNextRun.toISOString(),
      status: 'warning',
      message: `Atrasado ${Math.round(overdueMinutes)} minutos (grace period)`,
    }
  }

  // Past grace period
  return {
    name: jobDef.name,
    description: jobDef.description,
    healthy: false,
    lastRun: lastRunTime.toISOString(),
    nextExpectedRun: expectedNextRun.toISOString(),
    status: jobDef.critical ? 'critical' : 'warning',
    message: `Atrasado ${Math.round(overdueMinutes)} minutos - requiere atención`,
  }
}

// =============================================================================
// API Handler
// =============================================================================

export async function GET() {
  try {
    // Get actual job status from cron tracking table
    const cronStatus = await getCronJobStatus()
    const statusByName = new Map(cronStatus.map((s) => [s.job_name, s]))

    // Build health status for each job using real tracking data
    const jobs: JobHealth[] = CRON_JOBS.map((jobDef) => {
      const status = statusByName.get(jobDef.name)

      if (!status || !status.last_run_at) {
        return checkJobHealth(jobDef, null)
      }

      return checkJobHealth(jobDef, new Date(status.last_run_at))
    })

    // Check if any critical jobs are unhealthy
    const hasUnhealthyCritical = jobs.some(
      (job) =>
        !job.healthy &&
        CRON_JOBS.find((def) => def.name === job.name)?.critical
    )

    const hasWarnings = jobs.some((job) => job.status === 'warning')
    const allUnknown = jobs.every((job) => job.status === 'unknown')

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
    if (allUnknown) {
      overallStatus = 'unknown'
    } else if (hasUnhealthyCritical) {
      overallStatus = 'unhealthy'
    } else if (hasWarnings) {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'healthy'
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      jobs,
      summary: {
        total: jobs.length,
        healthy: jobs.filter((j) => j.healthy).length,
        warnings: jobs.filter((j) => j.status === 'warning').length,
        critical: jobs.filter((j) => j.status === 'critical').length,
        unknown: jobs.filter((j) => j.status === 'unknown').length,
      },
    }

    // Return 500 for unhealthy status (for monitoring tools)
    const httpStatus = overallStatus === 'unhealthy' ? 500 : 200

    return NextResponse.json(response, { status: httpStatus })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Comprehensive Health Check Endpoint
 *
 * GET /api/health
 *
 * Returns detailed health status including:
 * - Database connectivity
 * - Response times
 * - Service status
 *
 * Used by:
 * - Load balancers
 * - External monitoring (Betterstack, UptimeRobot, etc.)
 * - Status page integrations
 *
 * @see OPS-005: Uptime SLA Monitoring
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface HealthCheck {
  name: string
  healthy: boolean
  latencyMs: number
  error?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  checks: HealthCheck[]
  totalLatencyMs: number
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const supabase = await createClient()

    // Simple query to check connectivity
    const { error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)

    if (error) {
      return {
        name: 'database',
        healthy: false,
        latencyMs: Date.now() - start,
        error: error.message,
      }
    }

    return {
      name: 'database',
      healthy: true,
      latencyMs: Date.now() - start,
    }
  } catch (err) {
    return {
      name: 'database',
      healthy: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Check Supabase Auth service
 */
async function checkAuth(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    const supabase = await createClient()

    // Check auth is responsive (doesn't require actual auth)
    const { error } = await supabase.auth.getSession()

    // getSession may return null session (not logged in) but shouldn't error
    if (error && error.message !== 'Auth session missing!') {
      return {
        name: 'auth',
        healthy: false,
        latencyMs: Date.now() - start,
        error: error.message,
      }
    }

    return {
      name: 'auth',
      healthy: true,
      latencyMs: Date.now() - start,
    }
  } catch (err) {
    return {
      name: 'auth',
      healthy: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Check environment configuration
 */
function checkEnvironment(): HealthCheck {
  const start = Date.now()

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingVars = requiredEnvVars.filter(v => !process.env[v])

  if (missingVars.length > 0) {
    return {
      name: 'environment',
      healthy: false,
      latencyMs: Date.now() - start,
      error: `Missing env vars: ${missingVars.join(', ')}`,
    }
  }

  return {
    name: 'environment',
    healthy: true,
    latencyMs: Date.now() - start,
  }
}

/**
 * Determine overall status based on checks
 */
function determineStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
  const unhealthyCount = checks.filter(c => !c.healthy).length

  if (unhealthyCount === 0) return 'healthy'
  if (unhealthyCount === checks.length) return 'unhealthy'
  return 'degraded'
}

export async function GET() {
  const startTime = Date.now()

  // Run all checks in parallel
  const [database, auth, environment] = await Promise.all([
    checkDatabase(),
    checkAuth(),
    checkEnvironment(),
  ])

  const checks = [database, auth, environment]
  const status = determineStatus(checks)
  const totalLatencyMs = Date.now() - startTime

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
    totalLatencyMs,
  }

  // Return 200 for healthy/degraded, 503 for unhealthy
  const httpStatus = status === 'unhealthy' ? 503 : 200

  return NextResponse.json(response, { status: httpStatus })
}

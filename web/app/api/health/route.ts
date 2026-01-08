/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Returns basic health status for load balancers and monitoring.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  })
}

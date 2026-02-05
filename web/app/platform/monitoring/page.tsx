/**
 * Performance Monitoring Dashboard
 *
 * OPS-002: Platform-wide performance monitoring dashboard
 *
 * Displays real-time metrics including:
 * - System health status
 * - API response times
 * - Database performance
 * - Error rates
 * - Memory usage
 */

import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import for code splitting
const MonitoringDashboardClient = dynamic(() => import('./client').then(mod => ({ default: mod.MonitoringDashboardClient })), {
  loading: () => (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
})

export const metadata: Metadata = {
  title: 'Monitoreo de Rendimiento | Vete Platform',
  description: 'Panel de monitoreo de rendimiento de la plataforma',
}

export default function MonitoringDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <MonitoringDashboardClient />
    </Suspense>
  )
}

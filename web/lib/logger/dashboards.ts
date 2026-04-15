import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * Log Dashboards
 *
 * Provides functions for creating log dashboards.
 */

export async function createDashboard(
  tenantId: string,
  dashboardName: string
): Promise<void> {
  try {
    const supabase = await createClient()

    // Create dashboard
    const { data, error } = await supabase.from('dashboards').insert({
      tenant_id: tenantId,
      name: dashboardName,
    })

    if (error) {
      logger.error('Failed to create dashboard', { error: error.message })
      return
    }

    logger.info('Created dashboard', { dashboardId: data[0].id, dashboardName })
  } catch (error: unknown) {
    logger.error('Error creating dashboard', { error: error instanceof Error ? error.message : String(error) })
  }
}
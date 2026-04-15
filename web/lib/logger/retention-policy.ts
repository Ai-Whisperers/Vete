import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * Log Retention Policy
 *
 * Provides functions for managing log retention.
 */

export async function applyRetentionPolicy(
  tenantId: string,
  retentionDays: number
): Promise<void> {
  try {
    const supabase = await createClient()

    // Get logs from database
    const { data, error } = await supabase
      .from('logs')
      .select('id, created_at')
      .eq('tenant_id', tenantId)
      .lt('created_at', new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      logger.error('Failed to fetch logs', { error: error.message })
      return
    }

    // Delete old logs
    await supabase.from('logs').delete().eq('tenant_id', tenantId).in('id', data.map((log) => log.id))

    logger.info('Applied retention policy', { retentionDays, deletedLogs: data.length })
  } catch (error: unknown) {
    logger.error('Error applying retention policy', { error: error instanceof Error ? error.message : String(error) })
  }
}
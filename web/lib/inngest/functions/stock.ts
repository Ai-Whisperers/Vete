/**
 * Inngest Stock/Inventory Functions
 * 
 * Background jobs for stock operations:
 * - Release expired cart reservations
 * - Send customer stock alerts (back in stock)
 * - Send staff low stock alerts
 * - Send product expiry alerts
 */
import { inngest } from '../client'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { sendEmailWithRetry } from '@/lib/api/cron-external-calls'

// ... (rest of the file remains the same)
/**
 * Inngest Reminder Functions
 * 
 * Background jobs for reminder operations:
 * - Generate reminders from rules (vaccines, appointments, birthdays)
 * - Process and send pending reminders
 */
import { inngest } from '../client'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// ... (rest of the file remains the same)
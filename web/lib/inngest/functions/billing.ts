/**
 * Inngest Billing Functions
 * 
 * Background jobs for billing operations:
 * - Auto-charge invoices
 * - Evaluate grace periods
 * - Generate platform invoices
 * - Send billing reminders
 * - Generate commission invoices
 */
import { inngest } from '../client'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import {
  createPaymentIntent,
  toStripeAmount,
} from '@/lib/billing/stripe'
import { withTimeout, withRetry, isTimeoutError, TIMEOUT_PRESETS } from '@/lib/utils/timeout'

// ... (rest of the file remains the same)
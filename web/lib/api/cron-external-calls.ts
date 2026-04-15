import { sendEmail, type EmailOptions } from '@/lib/email/client'
import { processAutoCharge, type AutoChargeParams } from '@/lib/billing/stripe'
import { withTimeout, withRetry, TIMEOUT_PRESETS, isRetryableError } from '@/lib/utils/timeout'
import { logger } from '@/lib/logger'

/**
 * Send email with timeout protection.
 * 
 * Wraps the standard sendEmail function with a 15-second timeout.
 * If the email provider doesn't respond within 15 seconds, throws TimeoutError.
 * 
 * @param options Email options (to, subject, html, etc.)
 * @returns Promise resolving to email send result
 * @throws TimeoutError if email sending takes longer than 15 seconds
 */
export async function sendEmailWithTimeout(options: EmailOptions): Promise<void> {
  try {
    return await withTimeout(
      sendEmail(options),
      TIMEOUT_PRESETS.EMAIL, // 15 seconds
      `Email to ${options.to}`
    )
  } catch (error: unknown) {
    // Log timeout/failure but don't crash the cron job
    logger.error('Email sending failed or timed out in cron job', {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

/**
 * Send email with retry logic.
 * 
 * Wraps sendEmail with timeout + exponential backoff retry.
 * Retries up to 3 times on retryable errors (network failures, 5xx errors).
 * 
 * @param options Email options
 * @returns Promise resolving to email send result
 */
export async function sendEmailWithRetry(options: EmailOptions): Promise<void> {
  return withRetry(
    () => sendEmail(options),
    {
      maxRetries: 3,
      timeoutMs: TIMEOUT_PRESETS.EMAIL,
      baseDelayMs: 1000,
      maxDelayMs: 5000,
      isRetryable: isRetryableError,
      operationName: `Email to ${options.to}`,
      onRetry: (attempt, error) => {
        logger.warn('Retrying email send in cron job', {
          attempt,
          to: options.to,
          error: error.message,
        })
      },
    }
  )
}

/**
 * Process auto-charge with timeout and retry.
 * 
 * Wraps Stripe auto-charge with timeout + retry logic.
 * Critical for preventing payment processing hangs in cron jobs.
 * 
 * @param params Auto-charge parameters
 * @returns Promise resolving to charge result
 */
export async function chargeCustomerWithRetry(params: AutoChargeParams): Promise<void> {
  return withRetry(
    () => processAutoCharge(params),
    {
      maxRetries: 3,
      timeoutMs: TIMEOUT_PRESETS.PAYMENT, // 20 seconds
      baseDelayMs: 2000, // Start with 2s delay for payments
      maxDelayMs: 10000, // Max 10s delay
      isRetryable: (error) => {
        // Retry on network errors, timeouts, and Stripe rate limits
        if (isRetryableError(error)) {
          return true
        }
        
        // Don't retry on card declined, insufficient funds, etc.
        if (error.message.includes('card_declined') ||
            error.message.includes('insufficient_funds') ||
            error.message.includes('expired_card')) {
          return false
        }
        
        // Retry other Stripe errors
        return true
      },
      operationName: `Stripe charge for customer ${params.customerId}`,
      onRetry: (attempt, error) => {
        logger.warn('Retrying Stripe charge in cron job', {
          attempt,
          customerId: params.customerId,
          amount: params.amount,
          error: error.message,
        })
      },
    }
  )
}

/**
 * Generic HTTP fetch with timeout.
 * 
 * Wraps fetch calls with timeout protection.
 * Useful for webhook calls, API integrations, etc.
 * 
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds (default: 10s)
 * @returns Promise resolving to fetch response
 */
export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs: number = TIMEOUT_PRESETS.STANDARD
): Promise<Response> {
  try {
    return await withTimeout(
      fetch(url, options),
      timeoutMs,
      `HTTP ${options?.method || 'GET'} ${url}`
    )
  } catch (error: unknown) {
    logger.error('HTTP fetch failed or timed out in cron job', {
      url,
      method: options?.method || 'GET',
    })
    throw error
  }
}
/**
 * Email Client
 *
 * Handles email delivery using Resend API
 * Falls back to console.log if RESEND_API_KEY is not configured
 */

import { Resend } from 'resend'

// =============================================================================
// Types
// =============================================================================

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

export interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
}

// =============================================================================
// Client Configuration
// =============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY
const DEFAULT_FROM = process.env.EMAIL_FROM || 'noreply@veterinaria.com'

let resendClient: Resend | null = null

// Initialize Resend client if API key is available
if (RESEND_API_KEY) {
  try {
    resendClient = new Resend(RESEND_API_KEY)
    console.log('[Email] Resend client initialized')
  } catch (error) {
    console.error('[Email] Failed to initialize Resend client:', error)
  }
} else {
  console.warn('[Email] RESEND_API_KEY not configured - emails will be logged to console')
}

// =============================================================================
// Email Sending Functions
// =============================================================================

/**
 * Send an email using Resend or fallback to console.log
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const {
    to,
    subject,
    html,
    text,
    from = DEFAULT_FROM,
    replyTo,
    cc,
    bcc,
  } = options

  // Validate required fields
  if (!to || to.length === 0) {
    return {
      success: false,
      error: 'Recipient email address is required',
    }
  }

  if (!subject) {
    return {
      success: false,
      error: 'Email subject is required',
    }
  }

  if (!html) {
    return {
      success: false,
      error: 'Email HTML content is required',
    }
  }

  // If Resend is configured, use it
  if (resendClient) {
    try {
      const result = await resendClient.emails.send({
        from,
        to,
        subject,
        html,
        text,
        replyTo,
        cc,
        bcc,
      })

      if (result.error) {
        console.error('[Email] Resend error:', result.error)
        return {
          success: false,
          error: result.error.message || 'Failed to send email',
        }
      }

      console.log('[Email] Email sent successfully:', {
        messageId: result.data?.id,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
      })

      return {
        success: true,
        messageId: result.data?.id,
      }
    } catch (error) {
      console.error('[Email] Exception sending email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Fallback: Log to console
  console.log('📧 [Email] FALLBACK MODE - Email not sent (missing RESEND_API_KEY)')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('From:', from)
  console.log('To:', Array.isArray(to) ? to.join(', ') : to)
  if (cc) console.log('CC:', Array.isArray(cc) ? cc.join(', ') : cc)
  if (bcc) console.log('BCC:', Array.isArray(bcc) ? bcc.join(', ') : bcc)
  if (replyTo) console.log('Reply-To:', replyTo)
  console.log('Subject:', subject)
  console.log('───────────────────────────────────────────────────────────')
  console.log('HTML Content:')
  console.log(html)
  if (text) {
    console.log('───────────────────────────────────────────────────────────')
    console.log('Text Content:')
    console.log(text)
  }
  console.log('═══════════════════════════════════════════════════════════')

  return {
    success: true,
    messageId: `fallback-${Date.now()}`,
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return resendClient !== null
}

/**
 * Get the default "from" address
 */
export function getDefaultFrom(): string {
  return DEFAULT_FROM
}

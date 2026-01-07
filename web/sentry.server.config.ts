import * as Sentry from '@sentry/nextjs'

/**
 * Sentry server-side configuration
 * Initializes error tracking and performance monitoring for Node.js runtime
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Environment identification
  environment: process.env.NODE_ENV,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Multi-tenant context
  initialScope: {
    tags: {
      app: 'vete',
      runtime: 'nodejs',
    },
  },

  // Performance monitoring
  // Sample 20% of transactions in production for better coverage
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Capture unhandled promise rejections
  integrations: [
    // Capture console.error and console.warn
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn']
    }),
  ],

  // Scrub sensitive data before sending to Sentry
  beforeSend(event) {
    // Scrub sensitive fields from request data
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>
      const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization']

      for (const field of sensitiveFields) {
        if (data[field]) {
          data[field] = '[REDACTED]'
        }
      }
    }

    // Scrub sensitive headers
    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, string>
      if (headers['authorization']) {
        headers['authorization'] = '[REDACTED]'
      }
      if (headers['cookie']) {
        headers['cookie'] = '[REDACTED]'
      }
    }

    // Scrub user email if present (for GDPR compliance option)
    // Uncomment if you want to anonymize user data:
    // if (event.user?.email) {
    //   event.user.email = '[REDACTED]'
    // }

    return event
  },

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Network errors
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // Supabase session errors (handled by auth flow)
    'Auth session missing',
    'Session expired',
  ],
})

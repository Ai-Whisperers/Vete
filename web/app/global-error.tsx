'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Global app error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1B3A6B]/10">
            <AlertTriangle className="h-12 w-12 text-[#1B3A6B]" />
          </div>
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold text-[#1B3A6B]">Critical Error</h1>
            <p className="max-w-md text-gray-600">
              A critical error has occurred. Our team has been notified.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-lg bg-[#1B3A6B] px-5 py-2.5 font-medium text-white transition-colors hover:bg-[#0f2447]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <a
              href="/lealtis"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-[#1B3A6B] transition-colors hover:bg-gray-50"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </a>
          </div>
          {error.digest && (
            <p className="text-xs text-gray-400">Error ID: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  )
}

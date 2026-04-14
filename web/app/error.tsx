'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg text-center">
        <div className="relative mb-8">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#1B3A6B]/10">
            <AlertTriangle className="h-16 w-16 text-[#1B3A6B]" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-[#1B3A6B]">Something went wrong</h1>
        <p className="mx-auto mb-8 max-w-md text-gray-500">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] px-6 py-3 font-bold text-white transition-colors hover:bg-[#0f2447]"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>
          <Link
            href="/lealtis"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-bold text-[#1B3A6B] transition-colors hover:bg-gray-50"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * Dashboard Providers
 *
 * Provides React Query context for the dashboard.
 * This enables dynamic data fetching in dashboard components.
 */
export function DashboardProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

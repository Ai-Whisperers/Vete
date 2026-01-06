'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { FeatureFlagsProvider, type TenantFeatureAccess } from '@/lib/features'

interface DashboardProvidersProps {
  children: React.ReactNode
  tenantId: string
  initialFeatures?: TenantFeatureAccess
}

/**
 * Dashboard Providers
 *
 * Provides:
 * - React Query context for data fetching
 * - Feature flags context for tier-based feature gating
 */
export function DashboardProviders({ children, tenantId, initialFeatures }: DashboardProvidersProps) {
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

  return (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagsProvider tenantId={tenantId} initialFeatures={initialFeatures}>
        {children}
      </FeatureFlagsProvider>
    </QueryClientProvider>
  )
}

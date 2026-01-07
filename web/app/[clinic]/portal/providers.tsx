'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { CommandPaletteProvider } from '@/components/search/command-palette-provider'

export function PortalProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <CommandPaletteProvider>{children}</CommandPaletteProvider>
    </QueryClientProvider>
  )
}

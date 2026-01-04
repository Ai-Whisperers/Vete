'use client'

import { CommandPaletteProvider } from '@/components/search/command-palette-provider'

/**
 * Portal Layout - Adds command palette for logged-in users
 * This keeps the Cmd+K functionality scoped to portal pages only,
 * avoiding unnecessary keyboard listeners on public pages.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <CommandPaletteProvider>{children}</CommandPaletteProvider>
}

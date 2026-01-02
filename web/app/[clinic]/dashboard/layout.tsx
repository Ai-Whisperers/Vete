"use client";

import { CommandPaletteProvider } from "@/components/search/command-palette-provider";

/**
 * Dashboard Layout - Adds command palette for staff members
 * This keeps the Cmd+K functionality scoped to dashboard pages only,
 * avoiding unnecessary keyboard listeners on public pages.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommandPaletteProvider>
      {children}
    </CommandPaletteProvider>
  );
}

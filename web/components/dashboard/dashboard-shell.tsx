"use client";

import { Suspense, useState } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { BottomNavigation } from "./bottom-navigation";
import { QuickActionsHandler } from "./quick-actions-handler";
import { CommandPalette, useCommandPalette } from "@/components/ui/command-palette";
import { useKeyboardShortcuts, commonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { RecentItemsProvider } from "./recent-items-provider";
import { KeyboardShortcutsModal, useKeyboardShortcuts as useShortcutsModal } from "./keyboard-shortcuts-modal";
import { DashboardLabelsProvider } from "@/lib/hooks/use-dashboard-labels";

interface DashboardShellProps {
  clinic: string;
  clinicName: string;
  children: React.ReactNode;
}

export function DashboardShell({
  clinic,
  clinicName,
  children,
}: DashboardShellProps): React.ReactElement {
  const { isOpen, open, close } = useCommandPalette();
  const { isOpen: isShortcutsOpen, closeShortcuts, openShortcuts } = useShortcutsModal();

  // Enable global keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      commonShortcuts.openCommandPalette(open),
      { key: '?', action: openShortcuts },
    ],
    enabled: true,
  });

  return (
    <DashboardLabelsProvider>
      <RecentItemsProvider clinic={clinic}>
        {/* Command Palette */}
        <CommandPalette isOpen={isOpen} onClose={close} />

        {/* Keyboard Shortcuts Modal (triggered by ?) */}
        <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={closeShortcuts} />

        {/* Quick Actions Handler (slide-overs triggered by URL params) */}
        <Suspense fallback={null}>
          <QuickActionsHandler clinic={clinic} />
        </Suspense>

        <div className="flex min-h-screen bg-[var(--bg-subtle)]">
          {/* Desktop Sidebar */}
          <DashboardSidebar
            clinic={clinic}
            clinicName={clinicName}
            onOpenCommandPalette={open}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto lg:pb-0 pb-20">
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation clinic={clinic} />
      </RecentItemsProvider>
    </DashboardLabelsProvider>
  );
}

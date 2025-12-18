"use client";

import { DashboardSidebar } from "./dashboard-sidebar";
import { BottomNavigation } from "./bottom-navigation";
import { CommandPalette, useCommandPalette } from "@/components/ui/command-palette";

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

  return (
    <>
      {/* Command Palette */}
      <CommandPalette isOpen={isOpen} onClose={close} />

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
    </>
  );
}

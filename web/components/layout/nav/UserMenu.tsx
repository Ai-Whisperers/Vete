"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { ClinicConfig } from "@/lib/clinics";

interface UserMenuProps {
  clinic: string;
  config: ClinicConfig;
  user: SupabaseUser | null;
  isActive: (href: string, exact?: boolean) => boolean;
  isLoggingOut: boolean;
  logoutError: string | null;
  handleLogout: () => Promise<void>;
}

export function UserMenu({
  clinic,
  config,
  user,
  isActive,
  isLoggingOut,
  logoutError,
  handleLogout,
}: Readonly<UserMenuProps>) {
  return (
    <>
      <Link
        href={user ? `/${clinic}/portal/dashboard` : `/${clinic}/portal/login`}
        className={`text-base font-bold uppercase tracking-wide transition-colors relative group ${
          isActive(`/${clinic}/portal`)
            ? "text-[var(--primary)]"
            : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
        }`}
      >
        {user ? (config.ui_labels?.nav.my_portal || "Mi Portal") : (config.ui_labels?.nav.login || "Iniciar Sesión")}
        <span
          className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ${
            isActive(`/${clinic}/portal`) ? "w-full" : "w-0 group-hover:w-full"
          }`}
        ></span>
      </Link>

      {user && (
        <div className="relative">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--status-error,#dc2626)] hover:bg-[var(--status-error-bg,#fef2f2)] rounded-lg transition-colors disabled:opacity-50"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
          </button>
          {logoutError && (
            <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-[var(--status-error,#ef4444)] text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap z-50" role="alert">
              {logoutError}
            </div>
          )}
        </div>
      )}
    </>
  );
}

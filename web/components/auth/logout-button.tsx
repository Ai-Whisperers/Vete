"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutButtonProps {
  clinic: string;
  variant?: "default" | "text" | "icon";
  className?: string;
}

export function LogoutButton({
  clinic,
  variant = "default",
  className = "",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Refresh first to clear server-side cache, then navigate
      // This prevents race conditions where navigation happens before signOut completes
      router.refresh();
      // Small delay to ensure cookies are cleared before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push(`/${clinic}/portal/login`);
    } catch {
      // Logout error - still try to navigate to login
      router.push(`/${clinic}/portal/login`);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`p-2 text-[var(--text-muted)] hover:text-[var(--status-error,#dc2626)] hover:bg-[var(--status-error-bg,#fef2f2)] rounded-lg transition-colors disabled:opacity-50 ${className}`}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`text-[var(--text-muted)] hover:text-[var(--status-error,#dc2626)] font-bold uppercase tracking-wide transition-colors disabled:opacity-50 flex items-center gap-2 ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        Cerrar sesión
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--status-error,#dc2626)] hover:bg-[var(--status-error-bg,#fef2f2)] rounded-lg transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}

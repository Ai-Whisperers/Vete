"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import * as Icons from "lucide-react";

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
      router.push(`/${clinic}/portal/login`);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ${className}`}
        title="Cerrar sesión"
      >
        {isLoading ? (
          <Icons.Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Icons.LogOut className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`text-gray-500 hover:text-red-600 font-bold uppercase tracking-wide transition-colors disabled:opacity-50 flex items-center gap-2 ${className}`}
      >
        {isLoading ? (
          <Icons.Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Icons.LogOut className="w-4 h-4" />
        )}
        Cerrar sesión
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <Icons.Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icons.LogOut className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">Cerrar sesión</span>
    </button>
  );
}

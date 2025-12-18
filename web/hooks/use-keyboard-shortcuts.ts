"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  enabled = true,
}: UseKeyboardShortcutsOptions = {}): void {
  const router = useRouter();
  const { clinic } = useParams() as { clinic: string };
  const pathname = usePathname();

  const navigate = useCallback(
    (path: string): void => {
      router.push(`/${clinic}${path}`);
    },
    [router, clinic]
  );

  const navigateWithAction = useCallback(
    (path: string, action: string): void => {
      router.push(`/${clinic}${path}?action=${action}`);
    },
    [router, clinic]
  );

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K - Command Palette (handled by useCommandPalette hook)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }

      // G then another key for "Go to" shortcuts (vim-style)
      // We'll use simple single-key shortcuts instead for simplicity

      // Single key shortcuts (only when not in input)
      switch (e.key.toLowerCase()) {
        // Quick actions (shift + key)
        case "n":
          if (e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            // Context-aware new action
            if (pathname.includes("/appointments") || pathname.includes("/calendar")) {
              navigateWithAction("/dashboard/appointments", "new");
            } else if (pathname.includes("/invoices")) {
              navigateWithAction("/dashboard/invoices", "new");
            } else if (pathname.includes("/lab")) {
              navigateWithAction("/dashboard/lab", "new");
            } else if (pathname.includes("/vaccines")) {
              navigateWithAction("/dashboard/vaccines", "new");
            } else if (pathname.includes("/clients")) {
              navigateWithAction("/dashboard/clients", "new-client");
            } else {
              // Default to new appointment
              navigateWithAction("/dashboard/appointments", "new");
            }
          }
          break;

        // Navigation shortcuts (g + key style, but simplified to just single keys with modifier)
        case "d":
          if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard");
          }
          break;

        case "c":
          if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard/calendar");
          }
          break;

        case "a":
          if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard/appointments");
          }
          break;

        case "l":
          if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard/lab");
          }
          break;

        case "h":
          if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard/hospital");
          }
          break;

        case "i":
          if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard/invoices");
          }
          break;

        case "v":
          if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard/vaccines");
          }
          break;

        // ? for help/shortcuts modal
        case "?":
          if (e.shiftKey) {
            e.preventDefault();
            // Could show shortcuts modal - for now use command palette
            onOpenCommandPalette?.();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, pathname, navigate, navigateWithAction, onOpenCommandPalette]);
}

// List of available shortcuts for display
export const KEYBOARD_SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Abrir paleta de comandos" },
  { keys: ["Shift", "N"], description: "Nueva acción (contexto actual)" },
  { keys: ["Alt", "D"], description: "Ir al Dashboard" },
  { keys: ["Alt", "C"], description: "Ir al Calendario" },
  { keys: ["Alt", "A"], description: "Ir a Citas" },
  { keys: ["Alt", "L"], description: "Ir a Laboratorio" },
  { keys: ["Alt", "H"], description: "Ir a Hospitalización" },
  { keys: ["Alt", "I"], description: "Ir a Facturas" },
  { keys: ["Alt", "V"], description: "Ir a Vacunas" },
  { keys: ["?"], description: "Mostrar ayuda" },
] as const;

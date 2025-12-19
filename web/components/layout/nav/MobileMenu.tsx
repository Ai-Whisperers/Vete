"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar, Phone, PawPrint, User, Settings, LogOut, Calculator, Apple, HelpCircle, Gift } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { ClinicConfig } from "@/lib/clinics";
import type { UserProfile } from "./useNavAuth";
import type { LucideIcon } from "lucide-react";

interface MobileMenuProps {
  clinic: string;
  config: ClinicConfig;
  user: SupabaseUser | null;
  profile: UserProfile | null;
  navItems: NavItem[];
  isActive: (href: string, exact?: boolean) => boolean;
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
}

export interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
  icon: LucideIcon;
}

export function MobileMenu({
  clinic,
  config,
  user,
  profile,
  navItems,
  isActive,
  isLoggingOut,
  handleLogout,
}: Readonly<MobileMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);

  const toolsItems = [
    { label: config.ui_labels?.tools?.age_calculator || "Calculadora de Edad", href: `/${clinic}/tools/age-calculator`, icon: Calculator },
    { label: config.ui_labels?.tools?.toxic_food || "Alimentos Tóxicos", href: `/${clinic}/tools/toxic-food`, icon: Apple },
    { label: config.ui_labels?.nav?.faq || "Preguntas Frecuentes", href: `/${clinic}/faq`, icon: HelpCircle },
    { label: config.ui_labels?.nav?.loyalty_program || "Programa de Lealtad", href: `/${clinic}/loyalty_points`, icon: Gift },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const menuElement = mobileMenuRef.current;
    if (!menuElement) return;

    const focusableElements = menuElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        mobileMenuTriggerRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const mobileMenuContent = mounted ? createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] md:hidden"
          />
          <motion.div
            ref={mobileMenuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[var(--bg-default)] shadow-2xl z-[10000] md:hidden border-l border-[var(--primary)]/10 flex flex-col overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <span className="font-bold text-lg text-[var(--text-primary)]">{config.ui_labels?.nav?.menu || 'Menú'}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Cerrar menú"
              >
                <X size={24} />
              </button>
            </div>

            {user && profile && (
              <div className="px-6 py-4 bg-[var(--primary)]/5 border-b border-[var(--primary)]/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">
                    {profile.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-primary)] truncate">
                      {profile.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 sm:px-6 py-4">
              <Link
                href={`/${clinic}/book`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 w-full py-4 min-h-[52px] bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
              >
                <Calendar className="w-5 h-5" />
                {config.ui_labels?.nav.book_btn || 'Agendar Cita'}
              </Link>
            </div>

            <div className="flex-1 px-4 sm:px-6">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">{config.ui_labels?.nav?.navigation || 'Navegación'}</p>
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 py-4 px-4 min-h-[48px] rounded-xl transition-colors ${
                        isActive(item.href, item.exact)
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-bold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-6 mb-3">{config.ui_labels?.nav?.tools || 'Herramientas'}</p>
              <div className="flex flex-col gap-1">
                {toolsItems.map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 py-4 px-4 min-h-[48px] rounded-xl transition-colors ${
                        isActive(tool.href)
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      <ToolIcon className="w-5 h-5" />
                      <span className="font-bold">{tool.label}</span>
                    </Link>
                  );
                })}
              </div>

              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-6 mb-3">{config.ui_labels?.nav?.my_account || 'Mi Cuenta'}</p>
              <div className="flex flex-col gap-1">
                <Link
                  href={user ? `/${clinic}/portal/dashboard` : `/${clinic}/portal/login`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 py-4 px-4 min-h-[48px] rounded-xl transition-colors ${
                    isActive(`/${clinic}/portal/dashboard`)
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                  }`}
                >
                  <PawPrint className="w-5 h-5" />
                  <span className="font-bold">
                    {user ? (config.ui_labels?.nav.my_pets || 'Mis Mascotas') : (config.ui_labels?.nav.login || 'Iniciar Sesión')}
                  </span>
                </Link>

                {user && (
                  <>
                    <Link
                      href={`/${clinic}/portal/profile`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 py-4 px-4 min-h-[48px] rounded-xl transition-colors ${
                        isActive(`/${clinic}/portal/profile`)
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-bold">{config.ui_labels?.nav.profile || 'Mi Perfil'}</span>
                    </Link>
                    <Link
                      href={`/${clinic}/portal/settings`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 py-4 px-4 min-h-[48px] rounded-xl transition-colors ${
                        isActive(`/${clinic}/portal/settings`)
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-bold">{config.ui_labels?.nav?.settings || 'Configuración'}</span>
                    </Link>
                  </>
                )}
              </div>

              {user && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center gap-4 py-4 px-4 min-h-[48px] rounded-xl transition-colors text-[var(--status-error,#ef4444)] hover:bg-[var(--status-error-bg,#fef2f2)] w-full text-left mt-2 disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold">Cerrar sesión</span>
                </button>
              )}
            </div>

            <div className="mt-auto px-4 sm:px-6 py-6 bg-[var(--bg-subtle)] border-t border-[var(--border,#e5e7eb)]">
              {config.settings?.emergency_24h && (
                <a
                  href={`tel:${config.contact?.whatsapp_number}`}
                  className="flex items-center justify-center gap-2 w-full py-4 min-h-[48px] mb-4 bg-[var(--status-error,#ef4444)] text-white font-bold rounded-xl"
                >
                  <Phone className="w-4 h-4" />
                  {config.ui_labels?.nav.emergency_btn || 'Urgencias 24hs'}
                </a>
              )}
              <p className="text-center text-xs text-[var(--text-muted)]">
                © {new Date().getFullYear()} {config.name}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={mobileMenuTriggerRef}
        className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--primary)]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
      >
        <Menu size={28} />
      </button>
      {mobileMenuContent}
    </>
  );
}

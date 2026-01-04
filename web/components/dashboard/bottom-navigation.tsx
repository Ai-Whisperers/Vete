"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Users,
  Wallet,
  X,
  CalendarPlus,
  FileText,
  PawPrint,
  Syringe,
} from "lucide-react";

interface BottomNavigationProps {
  clinic: string;
}

export function BottomNavigation({ clinic }: BottomNavigationProps): React.ReactElement {
  const pathname = usePathname();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const isActive = (path: string): boolean => {
    if (path === "/dashboard" && pathname === `/${clinic}/dashboard`) return true;
    if (path !== "/dashboard" && pathname.startsWith(`/${clinic}${path}`)) return true;
    return false;
  };

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Inicio",
      href: "/dashboard",
    },
    {
      icon: Calendar,
      label: "Agenda",
      href: "/dashboard/calendar",
    },
    {
      icon: null, // Placeholder for center button
      label: "Nuevo",
      href: null,
    },
    {
      icon: Users,
      label: "Clientes",
      href: "/dashboard/clients",
    },
    {
      icon: Wallet,
      label: "Finanzas",
      href: "/dashboard/invoices",
    },
  ];

  const quickActions = [
    {
      icon: CalendarPlus,
      label: "Nueva cita",
      href: `/${clinic}/dashboard/appointments?action=new`,
      color: "bg-blue-500",
    },
    {
      icon: FileText,
      label: "Nueva factura",
      href: `/${clinic}/dashboard/invoices?action=new`,
      color: "bg-green-500",
    },
    {
      icon: PawPrint,
      label: "Nuevo paciente",
      href: `/${clinic}/dashboard/clients?action=new-pet`,
      color: "bg-purple-500",
    },
    {
      icon: Syringe,
      label: "Registrar vacuna",
      href: `/${clinic}/dashboard/vaccines?action=new`,
      color: "bg-orange-500",
    },
  ];

  return (
    <>
      {/* Quick Actions Modal */}
      <AnimatePresence>
        {showQuickActions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowQuickActions(false)}
            />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 left-0 right-0 z-50 px-4 lg:hidden"
            >
              <div className="bg-[var(--bg-paper)] rounded-3xl shadow-2xl p-4 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--text-primary)]">Acciones rápidas</h3>
                  <button
                    onClick={() => setShowQuickActions(false)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.label}
                        href={action.href}
                        onClick={() => setShowQuickActions(false)}
                        className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)] rounded-2xl hover:bg-[var(--bg-subtle)]/80 transition-colors"
                      >
                        <span
                          className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white`}
                        >
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="font-medium text-[var(--text-primary)] text-sm">
                          {action.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="bg-[var(--bg-paper)] border-t border-[var(--border-light)] px-2 pb-safe">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item, index) => {
              // Center button (FAB)
              if (index === 2) {
                return (
                  <button
                    key="fab"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className={`relative -mt-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      showQuickActions
                        ? "bg-gray-900 rotate-45"
                        : "bg-[var(--primary)]"
                    }`}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                );
              }

              const Icon = item.icon!;
              const active = isActive(item.href!);

              return (
                <Link
                  key={item.label}
                  href={`/${clinic}${item.href}`}
                  className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
                    active
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : ""}`} />
                  <span className={`text-xs mt-1 ${active ? "font-bold" : ""}`}>
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-0 w-8 h-1 bg-[var(--primary)] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

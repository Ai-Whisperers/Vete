"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";

interface NavItem {
  iconName: string;
  label: string;
  href: string;
}

interface PortalMobileNavProps {
  clinic: string;
  mainNavItems: NavItem[];
  financeItems: NavItem[];
  staffItems: NavItem[];
  adminItems: NavItem[];
  settingsItems: NavItem[];
}

// Helper to get icon component by name
function getIcon(name: string): React.ComponentType<{ className?: string }> {
  const icon = (Icons as Record<string, unknown>)[name];
  if (typeof icon === 'function') {
    return icon as React.ComponentType<{ className?: string }>;
  }
  return Icons.Circle;
}

export function PortalMobileNav({
  clinic,
  mainNavItems,
  financeItems,
  staffItems,
  adminItems,
  settingsItems,
}: PortalMobileNavProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
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

  const isActive = (href: string): boolean => pathname === href || pathname.startsWith(href + '/');

  const renderNavSection = (title: string, items: NavItem[]): React.ReactElement | null => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">
          {title}
        </p>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = getIcon(item.iconName);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-colors ${
                  isActive(item.href)
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
        aria-label="Abrir menú"
      >
        <Icons.Menu className="w-6 h-6" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 lg:hidden flex flex-col shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <span className="font-bold text-lg text-gray-800">Menú Portal</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <Icons.X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-y-auto py-4">
                {renderNavSection("Principal", mainNavItems)}
                {renderNavSection("Finanzas", financeItems)}
                {staffItems.length > 0 && renderNavSection("Staff", staffItems)}
                {adminItems.length > 0 && renderNavSection("Administración", adminItems)}
                {renderNavSection("Configuración", settingsItems)}
              </div>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
                <Link
                  href={`/${clinic}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Volver al Sitio
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

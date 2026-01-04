'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'

interface NavItem {
  iconName: string
  label: string
  href: string
}

interface PortalMobileNavProps {
  clinic: string
  mainNavItems: NavItem[]
  financeItems: NavItem[]
  staffItems: NavItem[]
  adminItems: NavItem[]
  settingsItems: NavItem[]
}

// Helper to get icon component by name
function getIcon(name: string): React.ComponentType<{ className?: string }> {
  const icon = (Icons as Record<string, unknown>)[name]
  if (typeof icon === 'function') {
    return icon as React.ComponentType<{ className?: string }>
  }
  return Icons.Circle
}

export function PortalMobileNav({
  clinic,
  mainNavItems,
  financeItems,
  staffItems,
  adminItems,
  settingsItems,
}: PortalMobileNavProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const isActive = (href: string): boolean => pathname === href || pathname.startsWith(href + '/')

  const renderNavSection = (title: string, items: NavItem[]): React.ReactElement | null => {
    if (items.length === 0) return null

    return (
      <div className="mb-6">
        <p className="mb-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
          {title}
        </p>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = getIcon(item.iconName)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isActive(item.href)
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="hover:bg-[var(--primary)]/5 rounded-lg p-2 text-gray-500 transition-all hover:text-[var(--primary)] lg:hidden"
        aria-label="Abrir menú"
      >
        <Icons.Menu className="h-6 w-6" />
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
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <span className="text-lg font-bold text-gray-800">Menú Portal</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
                  aria-label="Cerrar menú"
                >
                  <Icons.X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-y-auto py-4">
                {renderNavSection('Principal', mainNavItems)}
                {renderNavSection('Finanzas', financeItems)}
                {staffItems.length > 0 && renderNavSection('Staff', staffItems)}
                {adminItems.length > 0 && renderNavSection('Administración', adminItems)}
                {renderNavSection('Configuración', settingsItems)}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                <Link
                  href={`/${clinic}`}
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3 font-bold text-white transition-opacity hover:opacity-90"
                >
                  Volver al Sitio
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

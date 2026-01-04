'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Keyboard,
  Command,
  Search,
  Calendar,
  Users,
  PawPrint,
  FileText,
  Settings,
  Plus,
} from 'lucide-react'
import { useDashboardLabels } from '@/lib/hooks/use-dashboard-labels'
import { useModal } from '@/hooks/use-modal'
import { useState, useCallback } from 'react'
import { ErrorBoundary } from '@/components/shared'

/**
 * Hook for managing keyboard shortcuts modal state
 */
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  const openShortcuts = useCallback(() => setIsOpen(true), [])
  const closeShortcuts = useCallback(() => setIsOpen(false), [])
  const toggleShortcuts = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, openShortcuts, closeShortcuts, toggleShortcuts }
}

interface ShortcutCategory {
  title: string
  icon: React.ElementType
  shortcuts: {
    keys: string[]
    description: string
  }[]
}

const shortcutCategories: ShortcutCategory[] = [
  {
    title: 'Navegación General',
    icon: Command,
    shortcuts: [
      { keys: ['Ctrl/⌘', 'K'], description: 'Abrir búsqueda global' },
      { keys: ['Ctrl/⌘', '\\'], description: 'Colapsar/expandir sidebar' },
      { keys: ['?'], description: 'Mostrar atajos de teclado' },
      { keys: ['Esc'], description: 'Cerrar diálogos/paneles' },
      { keys: ['G', 'H'], description: 'Ir al Dashboard' },
      { keys: ['G', 'C'], description: 'Ir a Calendario' },
      { keys: ['G', 'P'], description: 'Ir a Pacientes' },
      { keys: ['G', 'I'], description: 'Ir a Inventario' },
      { keys: ['G', 'S'], description: 'Ir a Configuración' },
    ],
  },
  {
    title: 'Búsqueda y Filtros',
    icon: Search,
    shortcuts: [
      { keys: ['/'], description: 'Enfocar en búsqueda' },
      { keys: ['Ctrl/⌘', 'F'], description: 'Buscar en página actual' },
      { keys: ['Alt', '1-9'], description: 'Aplicar filtro rápido' },
    ],
  },
  {
    title: 'Citas y Calendario',
    icon: Calendar,
    shortcuts: [
      { keys: ['N'], description: 'Nueva cita (en calendario)' },
      { keys: ['T'], description: 'Ir a hoy' },
      { keys: ['←'], description: 'Período anterior' },
      { keys: ['→'], description: 'Período siguiente' },
      { keys: ['D'], description: 'Vista día' },
      { keys: ['W'], description: 'Vista semana' },
      { keys: ['M'], description: 'Vista mes' },
    ],
  },
  {
    title: 'Clientes y Pacientes',
    icon: Users,
    shortcuts: [
      { keys: ['Ctrl/⌘', 'N'], description: 'Nuevo cliente' },
      { keys: ['E'], description: 'Editar seleccionado' },
      { keys: ['Enter'], description: 'Ver detalle' },
      { keys: ['↑', '↓'], description: 'Navegar en lista' },
    ],
  },
  {
    title: 'Acciones Rápidas',
    icon: Plus,
    shortcuts: [
      { keys: ['Ctrl/⌘', 'Shift', 'C'], description: 'Nueva cita rápida' },
      { keys: ['Ctrl/⌘', 'Shift', 'R'], description: 'Nueva receta' },
      { keys: ['Ctrl/⌘', 'Shift', 'V'], description: 'Registrar vacuna' },
      { keys: ['Ctrl/⌘', 'Shift', 'F'], description: 'Nueva factura' },
    ],
  },
  {
    title: 'Otros',
    icon: Settings,
    shortcuts: [
      { keys: ['Ctrl/⌘', 'S'], description: 'Guardar cambios' },
      { keys: ['Ctrl/⌘', 'P'], description: 'Imprimir / Exportar PDF' },
      { keys: ['Ctrl/⌘', 'Z'], description: 'Deshacer' },
      { keys: ['Ctrl/⌘', 'Shift', 'Z'], description: 'Rehacer' },
    ],
  },
]

export interface KeyboardShortcutsModalProps {
  trigger?: React.ReactNode
  /** Controlled mode: whether the modal is open */
  isOpen?: boolean
  /** Controlled mode: callback when modal should close */
  onClose?: () => void
}

export function KeyboardShortcutsModal({
  trigger,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: KeyboardShortcutsModalProps = {}): React.ReactElement {
  const internalModal = useModal()
  const labels = useDashboardLabels()

  // Support both controlled and uncontrolled mode
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalModal.isOpen
  const close = controlledOnClose || internalModal.close
  const open = controlledOnClose ? undefined : internalModal.open

  return (
    <ErrorBoundary>
      {trigger && open && (
        <div onClick={open} className="cursor-pointer">
          {trigger}
        </div>
      )}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-black/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[80vh] md:w-[800px] md:-translate-x-1/2 md:-translate-y-1/2"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Keyboard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{labels.shortcuts.title}</h2>
                    <p className="text-sm text-white/70">{labels.shortcuts.subtitle}</p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="rounded-lg bg-white/20 p-2 transition-colors hover:bg-white/30"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {shortcutCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <div key={category.title} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[var(--primary)]" />
                          <h3 className="text-sm font-semibold text-gray-700">{category.title}</h3>
                        </div>
                        <div className="space-y-2">
                          {category.shortcuts.map((shortcut, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5"
                            >
                              <span className="text-sm text-gray-600">{shortcut.description}</span>
                              <div className="flex items-center gap-1">
                                {shortcut.keys.map((key, keyIdx) => (
                                  <span key={keyIdx}>
                                    <kbd className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                                      {key}
                                    </kbd>
                                    {keyIdx < shortcut.keys.length - 1 && (
                                      <span className="mx-1 text-gray-400">+</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <p className="text-center text-xs text-gray-500">
                  {labels.shortcuts.press_to_show}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  )
}

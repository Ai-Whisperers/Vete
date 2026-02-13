'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  Calendar,
  FileText,
  Package,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Check,
} from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  required: boolean
  action?: () => void
}

interface ClinicChecklistProps {
  clinicId: string
  clinicName: string
}

export function ClinicChecklist({ clinicId, clinicName }: ClinicChecklistProps): React.ReactElement {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'profile',
      title: 'Completar perfil de la clínica',
      description: 'Agregar logo, información de contacto, horarios',
      icon: <Building2 className="h-5 w-5" />,
      completed: false,
      required: true,
    },
    {
      id: 'staff',
      title: 'Agregar personal',
      description: 'Médicos veterinarios, recepcionistas, asistentes',
      icon: <Users className="h-5 w-5" />,
      completed: false,
      required: true,
    },
    {
      id: 'services',
      title: 'Configurar servicios',
      description: 'Crear servicios con precios y duraciones',
      icon: <Calendar className="h-5 w-5" />,
      completed: false,
      required: true,
    },
    {
      id: 'inventory',
      title: 'Configurar inventario',
      description: 'Agregar productos, vacunas, medicamentos',
      icon: <Package className="h-5 w-5" />,
      completed: false,
      required: false,
    },
    {
      id: 'templates',
      title: 'Configurar plantillas',
      description: 'Plantillas para historias clínicas, facturas, recetas',
      icon: <FileText className="h-5 w-5" />,
      completed: false,
      required: false,
    },
    {
      id: 'billing',
      title: 'Configurar facturación',
      description: 'Métodos de pago, secuencia de facturación',
      icon: <CreditCard className="h-5 w-5" />,
      completed: false,
      required: false,
    },
    {
      id: 'whatsapp',
      title: 'Conectar WhatsApp',
      description: 'Integrar WhatsApp para recordatorios y consultas',
      icon: <MessageSquare className="h-5 w-5" />,
      completed: false,
      required: false,
    },
  ])

  const [completedCount, setCompletedCount] = useState(0)
  const requiredCompleted = items.filter(item => item.required && item.completed).length
  const totalRequired = items.filter(item => item.required).length

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newCompleted = !item.completed
        if (newCompleted !== item.completed) {
          setCompletedCount(prevCount => newCompleted ? prevCount + 1 : prevCount - 1)
        }
        return { ...item, completed: newCompleted }
      }
      return item
    }))
  }

  const markAllAsComplete = () => {
    setItems(prev => prev.map(item => ({ ...item, completed: true })))
    setCompletedCount(items.length)
  }

  const completionPercentage = Math.round((completedCount / items.length) * 100)
  const requiredPercentage = Math.round((requiredCompleted / totalRequired) * 100)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Checklist de Onboarding</h2>
            <p className="text-sm text-gray-500">
              Completa estos pasos para configurar tu clínica en Vete
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600">Progreso</div>
              <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
            </div>
            <div className="relative h-12 w-12">
              <svg className="h-12 w-12" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeDasharray={`${completionPercentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{completedCount}/{items.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Required progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-gray-700">Requeridos: {requiredCompleted}/{totalRequired}</span>
            <span className="font-medium text-gray-700">{requiredPercentage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${requiredPercentage}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Completa todos los pasos requeridos para activar tu clínica
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
              item.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border ${
                item.completed
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {item.completed ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg p-2 ${
                  item.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <div className={item.completed ? 'text-green-600' : 'text-gray-600'}>
                    {item.icon}
                  </div>
                </div>
                <div>
                  <h3 className={`font-medium ${
                    item.completed ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {item.title}
                    {item.required && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Requerido
                      </span>
                    )}
                  </h3>
                  <p className={`text-sm ${
                    item.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center">
              {item.completed ? (
                <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Completado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                  <XCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Pendiente</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
        <div>
          <p className="text-sm text-gray-600">
            {requiredCompleted === totalRequired ? (
              <span className="font-medium text-green-600">
                ✅ Todos los requisitos completados. Tu clínica está lista.
              </span>
            ) : (
              <span className="font-medium text-amber-600">
                ⚠️ Completa {totalRequired - requiredCompleted} requisito(s) más para activar tu clínica.
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={markAllAsComplete}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Marcar todo como completo
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
            disabled={requiredCompleted < totalRequired}
          >
            Continuar al dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
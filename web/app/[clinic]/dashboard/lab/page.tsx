'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import * as Icons from 'lucide-react'
import Link from 'next/link'

interface LabOrder {
  id: string
  order_number: string
  ordered_date: string
  status: string
  priority: string
  has_critical_values: boolean
  pets: {
    id: string
    name: string
    species: string
  }
  profiles: {
    full_name: string
  }
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  ordered: {
    label: 'Ordenado',
    className: 'bg-blue-100 text-blue-800',
    icon: Icons.FileText
  },
  specimen_collected: {
    label: 'Muestra Recolectada',
    className: 'bg-purple-100 text-purple-800',
    icon: Icons.Droplet
  },
  in_progress: {
    label: 'En Proceso',
    className: 'bg-yellow-100 text-yellow-800',
    icon: Icons.Clock
  },
  completed: {
    label: 'Completado',
    className: 'bg-green-100 text-green-800',
    icon: Icons.CheckCircle
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800',
    icon: Icons.XCircle
  }
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  stat: {
    label: 'STAT',
    className: 'bg-red-500 text-white'
  },
  urgent: {
    label: 'Urgente',
    className: 'bg-orange-500 text-white'
  },
  routine: {
    label: 'Rutina',
    className: 'bg-gray-500 text-white'
  }
}

export default function LabOrdersPage() {
  const [orders, setOrders] = useState<LabOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const router = useRouter()
  const params = useParams()
  const clinic = params.clinic as string
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, showCriticalOnly])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push(`/${clinic}`)
        return
      }

      const { data, error } = await supabase
        .from('lab_orders')
        .select(`
          id,
          order_number,
          ordered_date,
          status,
          priority,
          has_critical_values,
          pets!inner(id, name, species),
          profiles!ordered_by(full_name)
        `)
        .order('ordered_date', { ascending: false })

      if (error) throw error
      setOrders(data as LabOrder[])
    } catch (error) {
      console.error('Error fetching lab orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(order =>
        order.pets.name.toLowerCase().includes(term) ||
        order.order_number.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Critical values filter
    if (showCriticalOnly) {
      filtered = filtered.filter(order => order.has_critical_values)
    }

    setFilteredOrders(filtered)
  }

  const getStatusCounts = () => {
    return {
      pending: orders.filter(o => o.status === 'ordered' || o.status === 'specimen_collected').length,
      in_progress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      critical: orders.filter(o => o.has_critical_values).length
    }
  }

  const counts = getStatusCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Órdenes de Laboratorio
          </h1>
          <p className="text-[var(--text-secondary)]">
            Gestiona pruebas y resultados de laboratorio
          </p>
        </div>
        <Link
          href={`/${clinic}/dashboard/lab/new`}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Icons.Plus className="w-5 h-5" />
          Nueva Orden
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setStatusFilter(statusFilter === 'ordered' ? 'all' : 'ordered')}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'ordered'
              ? 'border-[var(--primary)] bg-[var(--primary)]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Pendientes</span>
            <Icons.Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{counts.pending}</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'in_progress'
              ? 'border-[var(--primary)] bg-[var(--primary)]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">En Proceso</span>
            <Icons.Activity className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{counts.in_progress}</p>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`p-4 rounded-xl border-2 transition-all ${
            statusFilter === 'completed'
              ? 'border-[var(--primary)] bg-[var(--primary)]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Completados</span>
            <Icons.CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{counts.completed}</p>
        </button>

        <button
          onClick={() => setShowCriticalOnly(!showCriticalOnly)}
          className={`p-4 rounded-xl border-2 transition-all ${
            showCriticalOnly
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text-secondary)]">Valores Críticos</span>
            <Icons.AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{counts.critical}</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar por mascota o número de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Icons.FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-[var(--text-secondary)] text-lg">
            {searchTerm || statusFilter !== 'all' || showCriticalOnly
              ? 'No se encontraron órdenes con los filtros aplicados'
              : 'No hay órdenes de laboratorio'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.ordered
            const priority = priorityConfig[order.priority] || priorityConfig.routine
            const StatusIcon = status.icon

            return (
              <Link
                key={order.id}
                href={`/${clinic}/dashboard/lab/${order.id}`}
                className="block bg-white rounded-xl border-2 border-gray-100 hover:border-[var(--primary)] transition-all p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${status.className}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                          {order.pets.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${priority.className}`}>
                          {priority.label}
                        </span>
                        {order.has_critical_values && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <Icons.AlertTriangle className="w-3 h-3" />
                            Crítico
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Icons.Hash className="w-4 h-4" />
                          {order.order_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-4 h-4" />
                          {new Date(order.ordered_date).toLocaleDateString('es-PY')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.User className="w-4 h-4" />
                          {order.profiles.full_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.className}`}>
                      {status.label}
                    </span>
                    <Icons.ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

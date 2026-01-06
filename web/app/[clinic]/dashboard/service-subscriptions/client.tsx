'use client'

/**
 * Service Subscriptions Dashboard Client Component
 *
 * Staff management interface for recurring service subscriptions.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Calendar,
  MapPin,
  Truck,
  Package,
  Search,
  Plus,
  Edit,
  Eye,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Dog,
  Cat,
  Phone,
  User,
} from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { es } from 'date-fns/locale'

// Types
interface Subscription {
  id: string
  status: string
  started_at: string
  next_service_date: string | null
  current_price: number
  wants_pickup: boolean
  wants_delivery: boolean
  pickup_address: string | null
  delivery_address: string | null
  services_remaining_this_period: number
  total_services_used: number
  plan: { id: string; name: string; service: { id: string; name: string } }
  customer: { id: string; full_name: string; email: string; phone: string | null }
  pet: { id: string; name: string; species: string; breed: string | null }
}

interface Plan {
  id: string
  name: string
  description: string | null
  price_per_period: number
  billing_frequency: string
  service_frequency: string
  services_per_period: number
  includes_pickup: boolean
  includes_delivery: boolean
  pickup_fee: number
  delivery_fee: number
  is_active: boolean
  is_featured: boolean
  service: { id: string; name: string; category: string }
}

interface UpcomingService {
  instance_id: string
  scheduled_date: string
  pickup_status: string
  delivery_status: string
  customer_name: string
  customer_phone: string | null
  pet_name: string
  pet_species: string
  pickup_address: string | null
  delivery_address: string | null
  plan_name: string
  service_name: string
}

interface ServiceSubscriptionsDashboardProps {
  clinic: string
}

type TabId = 'subscriptions' | 'today' | 'plans'

export function ServiceSubscriptionsDashboard({ clinic }: ServiceSubscriptionsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('subscriptions')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [upcomingServices, setUpcomingServices] = useState<UpcomingService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [services, setServices] = useState<{ id: string; name: string; category: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 })

  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    service_id: '',
    price_per_period: '',
    billing_frequency: 'monthly',
    service_frequency: 'monthly',
    services_per_period: '1',
    includes_pickup: false,
    includes_delivery: false,
    pickup_fee: '0',
    delivery_fee: '0',
    is_featured: false,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (activeTab === 'subscriptions') {
        const params = new URLSearchParams()
        params.set('limit', pagination.limit.toString())
        params.set('offset', pagination.offset.toString())
        if (statusFilter !== 'all') params.set('status', statusFilter)

        const res = await fetch(`/api/subscriptions?${params}`)
        if (res.ok) {
          const data = await res.json()
          setSubscriptions(data.subscriptions || [])
          setPagination((prev) => ({ ...prev, total: data.pagination?.total || 0 }))
        }
      } else if (activeTab === 'plans') {
        const [plansRes, servicesRes] = await Promise.all([
          fetch('/api/subscriptions/plans?active_only=false'),
          fetch('/api/services'),
        ])

        if (plansRes.ok) {
          const data = await plansRes.json()
          setPlans(data || [])
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json()
          setServices(data.services || data || [])
        }
      } else if (activeTab === 'today') {
        const res = await fetch('/api/subscriptions/instances?date=today&needs_transport=true')
        if (res.ok) {
          const data = await res.json()
          setUpcomingServices(data.instances || [])
        }
      }
    } catch (err) {
      console.error(err)
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [activeTab, statusFilter, pagination.limit, pagination.offset])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      sub.customer.full_name.toLowerCase().includes(query) ||
      sub.pet.name.toLowerCase().includes(query) ||
      sub.plan.name.toLowerCase().includes(query)
    )
  })

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      description: '',
      service_id: '',
      price_per_period: '',
      billing_frequency: 'monthly',
      service_frequency: 'monthly',
      services_per_period: '1',
      includes_pickup: false,
      includes_delivery: false,
      pickup_fee: '0',
      delivery_fee: '0',
      is_featured: false,
    })
    setEditingPlan(null)
  }

  const handlePlanSubmit = async () => {
    if (!planForm.name || !planForm.service_id || !planForm.price_per_period) return

    setSubmitting(true)
    try {
      const method = editingPlan ? 'PUT' : 'POST'
      const url = editingPlan ? `/api/subscriptions/plans/${editingPlan.id}` : '/api/subscriptions/plans'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planForm,
          price_per_period: parseFloat(planForm.price_per_period),
          services_per_period: parseInt(planForm.services_per_period),
          pickup_fee: parseFloat(planForm.pickup_fee),
          delivery_fee: parseFloat(planForm.delivery_fee),
        }),
      })

      if (!res.ok) throw new Error('Error al guardar plan')

      await fetchData()
      setShowPlanModal(false)
      resetPlanForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      service_id: plan.service.id,
      price_per_period: plan.price_per_period.toString(),
      billing_frequency: plan.billing_frequency,
      service_frequency: plan.service_frequency,
      services_per_period: plan.services_per_period.toString(),
      includes_pickup: plan.includes_pickup,
      includes_delivery: plan.includes_delivery,
      pickup_fee: plan.pickup_fee.toString(),
      delivery_fee: plan.delivery_fee.toString(),
      is_featured: plan.is_featured,
    })
    setShowPlanModal(true)
  }

  const formatDate = (dateStr: string) =>
    formatInTimeZone(new Date(dateStr), 'America/Asuncion', 'd MMM yyyy', { locale: es })

  const formatFrequency = (freq: string) => {
    const map: Record<string, string> = {
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
    }
    return map[freq] || freq
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-[var(--status-success-bg,#dcfce7)] text-[var(--status-success,#16a34a)]',
      paused: 'bg-[var(--status-warning-bg,#fef3c7)] text-[var(--status-warning,#d97706)]',
      cancelled: 'bg-[var(--status-error-bg,#fef2f2)] text-[var(--status-error,#dc2626)]',
      pending: 'bg-[var(--bg-secondary,#f3f4f6)] text-[var(--text-secondary,#6b7280)]',
    }
    const labels: Record<string, string> = {
      active: 'Activa',
      paused: 'Pausada',
      cancelled: 'Cancelada',
      pending: 'Pendiente',
    }
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    )
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'subscriptions', label: 'Suscripciones', icon: <RefreshCw className="h-4 w-4" /> },
    { id: 'today', label: 'Hoy', icon: <Truck className="h-4 w-4" /> },
    { id: 'plans', label: 'Planes', icon: <Package className="h-4 w-4" /> },
  ]

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Suscripciones a Servicios</h1>
        <p className="text-[var(--text-muted)]">Gestiona suscripciones recurrentes y rutas de transporte</p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-[var(--border-light,#e5e7eb)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setPagination((prev) => ({ ...prev, offset: 0 }))
            }}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[var(--status-error,#dc2626)] bg-[var(--status-error-bg,#fef2f2)] p-4 text-[var(--status-error,#dc2626)]">
          <AlertCircle className="mr-2 inline h-5 w-5" />
          {error}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <SubscriptionsTab
          loading={loading}
          subscriptions={filteredSubscriptions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          pagination={pagination}
          setPagination={setPagination}
          setSelectedSubscription={setSelectedSubscription}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
        />
      )}

      {activeTab === 'today' && (
        <TodayTab loading={loading} upcomingServices={upcomingServices} />
      )}

      {activeTab === 'plans' && (
        <PlansTab
          loading={loading}
          plans={plans}
          handleEditPlan={handleEditPlan}
          setShowPlanModal={setShowPlanModal}
          resetPlanForm={resetPlanForm}
          formatFrequency={formatFrequency}
        />
      )}

      {selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
        />
      )}

      {showPlanModal && (
        <PlanFormModal
          editingPlan={editingPlan}
          planForm={planForm}
          setPlanForm={setPlanForm}
          services={services}
          submitting={submitting}
          onSubmit={handlePlanSubmit}
          onClose={() => {
            setShowPlanModal(false)
            resetPlanForm()
          }}
        />
      )}
    </div>
  )
}

// Sub-components

function SubscriptionsTab({
  loading,
  subscriptions,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  pagination,
  setPagination,
  setSelectedSubscription,
  formatDate,
  getStatusBadge,
}: {
  loading: boolean
  subscriptions: Subscription[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  pagination: { total: number; limit: number; offset: number }
  setPagination: React.Dispatch<React.SetStateAction<{ total: number; limit: number; offset: number }>>
  setSelectedSubscription: (s: Subscription) => void
  formatDate: (d: string) => string
  getStatusBadge: (s: string) => React.ReactNode
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por cliente, mascota o plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] px-3 py-2 text-sm text-[var(--text-primary)]"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="paused">Pausadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-8 text-center">
          <RefreshCw className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No hay suscripciones</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-light,#e5e7eb)] bg-[var(--bg-secondary,#f9fafb)]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--text-muted)]">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--text-muted)]">Mascota</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--text-muted)]">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--text-muted)]">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[var(--text-muted)]">Próximo</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-[var(--text-muted)]">Precio</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light,#e5e7eb)]">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="transition hover:bg-[var(--bg-secondary,#f9fafb)]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--text-primary)]">{sub.customer.full_name}</p>
                    {sub.customer.phone && <p className="text-xs text-[var(--text-muted)]">{sub.customer.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {sub.pet.species === 'dog' ? (
                        <Dog className="h-4 w-4 text-[var(--text-muted)]" />
                      ) : (
                        <Cat className="h-4 w-4 text-[var(--text-muted)]" />
                      )}
                      <span className="text-[var(--text-secondary)]">{sub.pet.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[var(--text-secondary)]">{sub.plan.name}</p>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {sub.next_service_date ? formatDate(sub.next_service_date) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-[var(--text-primary)]">
                    {sub.current_price.toLocaleString('es-PY')} Gs
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedSubscription(sub)}
                      className="rounded p-1 text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary,#f3f4f6)] hover:text-[var(--primary)]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Mostrando {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} de{' '}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
              className="rounded-lg border border-[var(--border-light,#e5e7eb)] p-2 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="rounded-lg border border-[var(--border-light,#e5e7eb)] p-2 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TodayTab({
  loading,
  upcomingServices,
}: {
  loading: boolean
  upcomingServices: UpcomingService[]
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (upcomingServices.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-8 text-center">
        <Truck className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
        <p className="text-[var(--text-muted)]">No hay recogidas ni entregas programadas para hoy</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {upcomingServices.map((service) => (
        <div
          key={service.instance_id}
          className="rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-5"
        >
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">{service.customer_name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{service.plan_name}</p>
            </div>
            <div className="flex items-center gap-2">
              {service.pickup_status === 'pending' && (
                <span className="rounded bg-[var(--status-warning-bg,#fef3c7)] px-2 py-0.5 text-xs font-medium text-[var(--status-warning,#d97706)]">
                  Recoger
                </span>
              )}
              {service.delivery_status === 'pending' && (
                <span className="rounded bg-[var(--primary-light,#e0e7ff)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                  Entregar
                </span>
              )}
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {service.pet_species === 'dog' ? (
              <Dog className="h-4 w-4 text-[var(--text-muted)]" />
            ) : (
              <Cat className="h-4 w-4 text-[var(--text-muted)]" />
            )}
            <span>{service.pet_name}</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>{service.service_name}</span>
          </div>

          {service.pickup_address && (
            <div className="mb-2 flex items-start gap-2 text-sm">
              <Truck className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">Recogida:</p>
                <p className="text-[var(--text-secondary)]">{service.pickup_address}</p>
              </div>
            </div>
          )}

          {service.delivery_address && (
            <div className="mb-3 flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">Entrega:</p>
                <p className="text-[var(--text-secondary)]">{service.delivery_address}</p>
              </div>
            </div>
          )}

          {service.customer_phone && (
            <a
              href={`tel:${service.customer_phone}`}
              className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
            >
              <Phone className="h-4 w-4" />
              {service.customer_phone}
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

function PlansTab({
  loading,
  plans,
  handleEditPlan,
  setShowPlanModal,
  resetPlanForm,
  formatFrequency,
}: {
  loading: boolean
  plans: Plan[]
  handleEditPlan: (p: Plan) => void
  setShowPlanModal: (v: boolean) => void
  resetPlanForm: () => void
  formatFrequency: (f: string) => string
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Planes de Suscripción</h2>
        <button
          onClick={() => {
            resetPlanForm()
            setShowPlanModal(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nuevo Plan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-8 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
          <p className="text-[var(--text-muted)]">No hay planes creados</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border bg-[var(--bg-primary,#fff)] p-5 ${
                plan.is_active
                  ? 'border-[var(--border-light,#e5e7eb)]'
                  : 'border-dashed border-[var(--status-error,#dc2626)] opacity-60'
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{plan.service.name}</p>
                </div>
                {plan.is_featured && (
                  <span className="rounded bg-[var(--primary-light,#e0e7ff)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                    Destacado
                  </span>
                )}
              </div>

              <div className="mb-3">
                <span className="text-xl font-bold text-[var(--text-primary)]">
                  {plan.price_per_period.toLocaleString('es-PY')}
                </span>
                <span className="text-sm text-[var(--text-muted)]"> Gs/{formatFrequency(plan.billing_frequency).toLowerCase()}</span>
              </div>

              <ul className="mb-4 space-y-1 text-sm text-[var(--text-secondary)]">
                <li>• {plan.services_per_period} servicios por período</li>
                {plan.includes_pickup && <li>• Recogida: +{plan.pickup_fee.toLocaleString('es-PY')} Gs</li>}
                {plan.includes_delivery && <li>• Entrega: +{plan.delivery_fee.toLocaleString('es-PY')} Gs</li>}
              </ul>

              <button
                onClick={() => handleEditPlan(plan)}
                className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
              >
                <Edit className="mr-2 inline h-4 w-4" />
                Editar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SubscriptionDetailModal({
  subscription,
  onClose,
  formatDate,
  getStatusBadge,
}: {
  subscription: Subscription
  onClose: () => void
  formatDate: (d: string) => string
  getStatusBadge: (s: string) => React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--bg-primary,#fff)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Detalle de Suscripción</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-[var(--bg-secondary,#f9fafb)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--text-muted)]" />
              <span className="font-medium text-[var(--text-primary)]">{subscription.customer.full_name}</span>
            </div>
            {subscription.customer.phone && (
              <p className="mb-1 text-sm text-[var(--text-muted)]">{subscription.customer.phone}</p>
            )}
            <p className="text-sm text-[var(--text-muted)]">{subscription.customer.email}</p>
          </div>

          <div className="rounded-lg bg-[var(--bg-secondary,#f9fafb)] p-4">
            <div className="flex items-center gap-2">
              {subscription.pet.species === 'dog' ? (
                <Dog className="h-4 w-4 text-[var(--text-muted)]" />
              ) : (
                <Cat className="h-4 w-4 text-[var(--text-muted)]" />
              )}
              <span className="font-medium text-[var(--text-primary)]">{subscription.pet.name}</span>
              {subscription.pet.breed && (
                <span className="text-sm text-[var(--text-muted)]">{subscription.pet.breed}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--text-primary)]">{subscription.plan.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{subscription.plan.service.name}</p>
            </div>
            {getStatusBadge(subscription.status)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)]">Precio mensual</p>
              <p className="font-medium text-[var(--text-primary)]">
                {subscription.current_price.toLocaleString('es-PY')} Gs
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Servicios usados</p>
              <p className="font-medium text-[var(--text-primary)]">{subscription.total_services_used}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Próximo servicio</p>
              <p className="font-medium text-[var(--text-primary)]">
                {subscription.next_service_date ? formatDate(subscription.next_service_date) : '-'}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Restantes</p>
              <p className="font-medium text-[var(--text-primary)]">{subscription.services_remaining_this_period}</p>
            </div>
          </div>

          {(subscription.wants_pickup || subscription.wants_delivery) && (
            <div className="rounded-lg bg-[var(--bg-secondary,#f9fafb)] p-4">
              <h4 className="mb-2 font-medium text-[var(--text-primary)]">Transporte</h4>
              {subscription.wants_pickup && subscription.pickup_address && (
                <div className="mb-2 text-sm">
                  <p className="text-[var(--text-muted)]">Recogida:</p>
                  <p className="text-[var(--text-secondary)]">{subscription.pickup_address}</p>
                </div>
              )}
              {subscription.wants_delivery && subscription.delivery_address && (
                <div className="text-sm">
                  <p className="text-[var(--text-muted)]">Entrega:</p>
                  <p className="text-[var(--text-secondary)]">{subscription.delivery_address}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PlanFormModal({
  editingPlan,
  planForm,
  setPlanForm,
  services,
  submitting,
  onSubmit,
  onClose,
}: {
  editingPlan: Plan | null
  planForm: {
    name: string
    description: string
    service_id: string
    price_per_period: string
    billing_frequency: string
    service_frequency: string
    services_per_period: string
    includes_pickup: boolean
    includes_delivery: boolean
    pickup_fee: string
    delivery_fee: string
    is_featured: boolean
  }
  setPlanForm: React.Dispatch<React.SetStateAction<typeof planForm>>
  services: { id: string; name: string; category: string }[]
  submitting: boolean
  onSubmit: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--bg-primary,#fff)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Nombre del plan *</label>
            <input
              type="text"
              value={planForm.name}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
              placeholder="Ej: Baño Mensual Premium"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Descripción</label>
            <textarea
              value={planForm.description}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Servicio *</label>
            <select
              value={planForm.service_id}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, service_id: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
            >
              <option value="">Seleccionar servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Precio *</label>
              <input
                type="number"
                value={planForm.price_per_period}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, price_per_period: e.target.value }))}
                className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
                placeholder="150000"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Frecuencia cobro</label>
              <select
                value={planForm.billing_frequency}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, billing_frequency: e.target.value }))}
                className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Frecuencia servicio</label>
              <select
                value={planForm.service_frequency}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, service_frequency: e.target.value }))}
                className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Servicios/período</label>
              <input
                type="number"
                value={planForm.services_per_period}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, services_per_period: e.target.value }))}
                min="1"
                className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="rounded-lg bg-[var(--bg-secondary,#f9fafb)] p-4">
            <h4 className="mb-3 font-medium text-[var(--text-primary)]">Transporte</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={planForm.includes_pickup}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, includes_pickup: e.target.checked }))}
                  className="rounded border-[var(--border-light,#e5e7eb)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Incluir opción de recogida</span>
              </label>
              {planForm.includes_pickup && (
                <div className="ml-6">
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Costo de recogida (Gs)</label>
                  <input
                    type="number"
                    value={planForm.pickup_fee}
                    onChange={(e) => setPlanForm((prev) => ({ ...prev, pickup_fee: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              )}

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={planForm.includes_delivery}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, includes_delivery: e.target.checked }))}
                  className="rounded border-[var(--border-light,#e5e7eb)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Incluir opción de entrega</span>
              </label>
              {planForm.includes_delivery && (
                <div className="ml-6">
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Costo de entrega (Gs)</label>
                  <input
                    type="number"
                    value={planForm.delivery_fee}
                    onChange={(e) => setPlanForm((prev) => ({ ...prev, delivery_fee: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={planForm.is_featured}
              onChange={(e) => setPlanForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
              className="rounded border-[var(--border-light,#e5e7eb)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Destacar plan</span>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--border-light,#e5e7eb)] px-4 py-2 font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!planForm.name || !planForm.service_id || !planForm.price_per_period || submitting}
            className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}

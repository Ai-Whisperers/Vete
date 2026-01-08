'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  Calendar,
  MapPin,
  Truck,
  Star,
  Pause,
  Play,
  X,
  Clock,
  ChevronRight,
  Plus,
  Dog,
  Cat,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { formatInTimeZone } from 'date-fns-tz'
import { es } from 'date-fns/locale'

// Types
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
  discount_percent: number
  first_month_discount: number
  species_allowed: string[]
  max_pet_weight_kg: number | null
  is_featured: boolean
  service: {
    id: string
    name: string
    category: string
    duration_minutes: number
  }
}

interface Subscription {
  id: string
  status: string
  started_at: string
  next_service_date: string | null
  next_billing_date: string | null
  current_price: number
  wants_pickup: boolean
  wants_delivery: boolean
  pickup_address: string | null
  delivery_address: string | null
  services_remaining_this_period: number
  preferred_day_of_week: number | null
  preferred_time_slot: string | null
  plan: {
    id: string
    name: string
    service: {
      id: string
      name: string
    }
  }
  pet: {
    id: string
    name: string
    species: string
  }
  instances: {
    id: string
    scheduled_date: string
    status: string
    pickup_status: string
    delivery_status: string
    customer_rating: number | null
    completed_at: string | null
  }[]
}

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  weight_kg: number | null
  photo_url: string | null
}

interface ServiceSubscriptionsClientProps {
  clinic: string
  clinicName: string
}

export function ServiceSubscriptionsClient({ clinic, clinicName }: ServiceSubscriptionsClientProps) {
  // State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [preferredDay, setPreferredDay] = useState<number>(1) // Monday
  const [preferredTime, setPreferredTime] = useState<string>('morning')
  const [wantsPickup, setWantsPickup] = useState(false)
  const [wantsDelivery, setWantsDelivery] = useState(false)
  const [pickupAddress, setPickupAddress] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Detail modal state
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [subsRes, plansRes, petsRes] = await Promise.all([
          fetch('/api/subscriptions'),
          fetch('/api/subscriptions/plans'),
          fetch('/api/pets'),
        ])

        if (subsRes.ok) {
          const subsData = await subsRes.json()
          setSubscriptions(subsData.subscriptions || [])
        }

        if (plansRes.ok) {
          const plansData = await plansRes.json()
          setPlans(plansData || [])
        }

        if (petsRes.ok) {
          const petsData = await petsRes.json()
          setPets(petsData.pets || petsData || [])
        }
      } catch (err) {
        setError('Error al cargar datos')
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate price
  const calculatePrice = (plan: Plan): number => {
    let price = plan.price_per_period
    if (plan.first_month_discount > 0) {
      price = price * (1 - plan.first_month_discount / 100)
    }
    if (wantsPickup && plan.includes_pickup) {
      price += plan.pickup_fee
    }
    if (wantsDelivery && plan.includes_delivery) {
      price += plan.delivery_fee
    }
    return price
  }

  // Handle subscribe
  const handleSubscribe = async () => {
    if (!selectedPlan || !selectedPetId) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          pet_id: selectedPetId,
          preferred_day_of_week: preferredDay,
          preferred_time_slot: preferredTime,
          wants_pickup: wantsPickup && selectedPlan.includes_pickup,
          wants_delivery: wantsDelivery && selectedPlan.includes_delivery,
          pickup_address: wantsPickup ? pickupAddress : null,
          delivery_address: wantsDelivery ? deliveryAddress : null,
          special_instructions: specialInstructions || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message || 'Error al crear suscripción')
      }

      const newSub = await res.json()
      setSubscriptions((prev) => [newSub, ...prev])
      setShowSubscribeModal(false)
      resetForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al suscribirse')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle pause/resume
  const handleToggleStatus = async (sub: Subscription) => {
    const newStatus = sub.status === 'active' ? 'paused' : 'active'

    try {
      const res = await fetch(`/api/subscriptions/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s))
        )
      }
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }
  }

  // Handle cancel
  const handleCancel = async (subId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta suscripción?')) return

    try {
      const res = await fetch(`/api/subscriptions/${subId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelado por el cliente' }),
      })

      if (res.ok) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subId ? { ...s, status: 'cancelled' } : s))
        )
        setSelectedSubscription(null)
      }
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedPlan(null)
    setSelectedPetId('')
    setPreferredDay(1)
    setPreferredTime('morning')
    setWantsPickup(false)
    setWantsDelivery(false)
    setPickupAddress('')
    setDeliveryAddress('')
    setSpecialInstructions('')
  }

  // Format helpers
  const formatDate = (dateStr: string) => {
    return formatInTimeZone(new Date(dateStr), 'America/Asuncion', 'd MMM yyyy', { locale: es })
  }

  const formatFrequency = (freq: string) => {
    const map: Record<string, string> = {
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
    }
    return map[freq] || freq
  }

  const getDayName = (day: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    return days[day]
  }

  const getTimeSlotLabel = (slot: string) => {
    const map: Record<string, string> = {
      morning: 'Mañana (8-12h)',
      afternoon: 'Tarde (12-18h)',
      evening: 'Noche (18-21h)',
    }
    return map[slot] || slot
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

  // Get eligible pets for a plan
  const getEligiblePets = (plan: Plan) => {
    return pets.filter((pet) => {
      if (!plan.species_allowed.includes(pet.species)) return false
      if (plan.max_pet_weight_kg && pet.weight_kg && pet.weight_kg > plan.max_pet_weight_kg) return false
      return true
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${clinic}/portal/dashboard`}
          className="mb-4 inline-flex items-center gap-2 text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al portal
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light,#e0e7ff)]">
              <RefreshCw className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Suscripciones a Servicios</h1>
              <p className="text-[var(--text-muted)]">Servicios recurrentes con recogida a domicilio</p>
            </div>
          </div>
          <Link
            href={`/${clinic}/portal/subscriptions`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--primary)] px-4 py-2 font-medium text-[var(--primary)] transition hover:bg-[var(--primary)]/10"
          >
            <RefreshCw className="h-4 w-4" />
            Ver Suscripciones a Productos
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-[var(--status-error,#dc2626)] bg-[var(--status-error-bg,#fef2f2)] p-4 text-[var(--status-error,#dc2626)]">
          <AlertCircle className="mr-2 inline h-5 w-5" />
          {error}
        </div>
      )}

      {/* Active Subscriptions */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Mis Suscripciones</h2>

        {subscriptions.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-8 text-center">
            <RefreshCw className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">No tienes suscripciones activas</h3>
            <p className="mb-4 text-[var(--text-muted)]">
              Suscríbete a un plan para recibir servicios recurrentes con recogida y entrega a domicilio.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="cursor-pointer rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-5 transition hover:border-[var(--primary)] hover:shadow-md"
                onClick={() => setSelectedSubscription(sub)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{sub.plan.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{sub.plan.service.name}</p>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>

                <div className="mb-3 flex items-center gap-2">
                  {sub.pet.species === 'dog' ? (
                    <Dog className="h-4 w-4 text-[var(--text-muted)]" />
                  ) : (
                    <Cat className="h-4 w-4 text-[var(--text-muted)]" />
                  )}
                  <span className="text-sm text-[var(--text-secondary)]">{sub.pet.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                    <span className="text-[var(--text-secondary)]">
                      {sub.next_service_date ? formatDate(sub.next_service_date) : 'Sin programar'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--primary)]">
                      {sub.current_price.toLocaleString('es-PY')} Gs
                    </span>
                  </div>
                </div>

                {(sub.wants_pickup || sub.wants_delivery) && (
                  <div className="mt-3 flex items-center gap-2 border-t border-[var(--border-light,#e5e7eb)] pt-3">
                    <Truck className="h-4 w-4 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {sub.wants_pickup && sub.wants_delivery
                        ? 'Recogida y entrega'
                        : sub.wants_pickup
                          ? 'Solo recogida'
                          : 'Solo entrega'}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Plans */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Planes Disponibles</h2>

        {plans.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-8 text-center">
            <p className="text-[var(--text-muted)]">No hay planes de suscripción disponibles por el momento.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border bg-[var(--bg-primary,#fff)] p-5 transition hover:shadow-md ${
                  plan.is_featured
                    ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-20'
                    : 'border-[var(--border-light,#e5e7eb)]'
                }`}
              >
                {plan.is_featured && (
                  <span className="absolute -top-3 right-4 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white">
                    Popular
                  </span>
                )}

                <div className="mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">{plan.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{plan.service.name}</p>
                </div>

                {plan.description && (
                  <p className="mb-4 text-sm text-[var(--text-secondary)]">{plan.description}</p>
                )}

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {plan.price_per_period.toLocaleString('es-PY')}
                    </span>
                    <span className="text-sm text-[var(--text-muted)]">Gs/{formatFrequency(plan.billing_frequency).toLowerCase()}</span>
                  </div>

                  {plan.first_month_discount > 0 && (
                    <span className="text-sm text-[var(--status-success,#16a34a)]">
                      {plan.first_month_discount}% desc. primer mes
                    </span>
                  )}
                </div>

                <ul className="mb-4 space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[var(--status-success,#16a34a)]" />
                    {plan.services_per_period} {plan.services_per_period === 1 ? 'servicio' : 'servicios'} por período
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                    {plan.service.duration_minutes} min por sesión
                  </li>
                  {plan.includes_pickup && (
                    <li className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[var(--text-muted)]" />
                      Recogida a domicilio
                      {plan.pickup_fee > 0 && ` (+${plan.pickup_fee.toLocaleString('es-PY')} Gs)`}
                    </li>
                  )}
                  {plan.includes_delivery && (
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                      Entrega a domicilio
                      {plan.delivery_fee > 0 && ` (+${plan.delivery_fee.toLocaleString('es-PY')} Gs)`}
                    </li>
                  )}
                </ul>

                <div className="mb-4 flex items-center gap-1">
                  {plan.species_allowed.map((sp) =>
                    sp === 'dog' ? (
                      <Dog key={sp} className="h-4 w-4 text-[var(--text-muted)]" />
                    ) : (
                      <Cat key={sp} className="h-4 w-4 text-[var(--text-muted)]" />
                    )
                  )}
                  {plan.max_pet_weight_kg && (
                    <span className="text-xs text-[var(--text-muted)]">Hasta {plan.max_pet_weight_kg}kg</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedPlan(plan)
                    setShowSubscribeModal(true)
                  }}
                  className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white transition hover:brightness-110"
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Suscribirse
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subscribe Modal */}
      {showSubscribeModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--bg-primary,#fff)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Nueva Suscripción</h2>
              <button
                onClick={() => {
                  setShowSubscribeModal(false)
                  resetForm()
                }}
                className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-lg bg-[var(--bg-secondary,#f9fafb)] p-4">
              <h3 className="font-medium text-[var(--text-primary)]">{selectedPlan.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{selectedPlan.service.name}</p>
            </div>

            {/* Pet Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Selecciona tu mascota
              </label>
              <div className="grid gap-2">
                {getEligiblePets(selectedPlan).length === 0 ? (
                  <p className="text-sm text-[var(--status-error,#dc2626)]">
                    No tienes mascotas elegibles para este plan
                  </p>
                ) : (
                  getEligiblePets(selectedPlan).map((pet) => (
                    <label
                      key={pet.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                        selectedPetId === pet.id
                          ? 'border-[var(--primary)] bg-[var(--primary-light,#e0e7ff)]'
                          : 'border-[var(--border-light,#e5e7eb)] hover:border-[var(--primary)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pet"
                        value={pet.id}
                        checked={selectedPetId === pet.id}
                        onChange={(e) => setSelectedPetId(e.target.value)}
                        className="sr-only"
                      />
                      {pet.species === 'dog' ? (
                        <Dog className="h-5 w-5 text-[var(--text-muted)]" />
                      ) : (
                        <Cat className="h-5 w-5 text-[var(--text-muted)]" />
                      )}
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{pet.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {pet.breed || pet.species}
                          {pet.weight_kg && ` • ${pet.weight_kg}kg`}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Scheduling */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Día preferido
                </label>
                <select
                  value={preferredDay}
                  onChange={(e) => setPreferredDay(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
                >
                  {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                    <option key={day} value={day}>
                      {getDayName(day)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Horario preferido
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-[var(--text-primary)]"
                >
                  <option value="morning">Mañana (8-12h)</option>
                  <option value="afternoon">Tarde (12-18h)</option>
                  <option value="evening">Noche (18-21h)</option>
                </select>
              </div>
            </div>

            {/* Pickup/Delivery Options */}
            {(selectedPlan.includes_pickup || selectedPlan.includes_delivery) && (
              <div className="mb-6">
                <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">Servicios de transporte</p>

                {selectedPlan.includes_pickup && (
                  <label className="mb-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={wantsPickup}
                      onChange={(e) => setWantsPickup(e.target.checked)}
                      className="mt-1 rounded border-[var(--border-light,#e5e7eb)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Recogida a domicilio
                        {selectedPlan.pickup_fee > 0 && (
                          <span className="ml-2 text-[var(--text-muted)]">
                            +{selectedPlan.pickup_fee.toLocaleString('es-PY')} Gs
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Recogemos a tu mascota en la dirección indicada
                      </p>
                    </div>
                  </label>
                )}

                {wantsPickup && (
                  <div className="mb-4 ml-6">
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Dirección de recogida"
                      className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                )}

                {selectedPlan.includes_delivery && (
                  <label className="mb-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={wantsDelivery}
                      onChange={(e) => setWantsDelivery(e.target.checked)}
                      className="mt-1 rounded border-[var(--border-light,#e5e7eb)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Entrega a domicilio
                        {selectedPlan.delivery_fee > 0 && (
                          <span className="ml-2 text-[var(--text-muted)]">
                            +{selectedPlan.delivery_fee.toLocaleString('es-PY')} Gs
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Entregamos a tu mascota una vez finalizado el servicio
                      </p>
                    </div>
                  </label>
                )}

                {wantsDelivery && (
                  <div className="mb-4 ml-6">
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Dirección de entrega (si es diferente)"
                      className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Special Instructions */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Instrucciones especiales (opcional)
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={2}
                placeholder="Notas para el equipo de servicio..."
                className="w-full rounded-lg border border-[var(--border-light,#e5e7eb)] bg-[var(--bg-primary,#fff)] p-2 text-sm text-[var(--text-primary)]"
              />
            </div>

            {/* Price Summary */}
            <div className="mb-6 rounded-lg bg-[var(--bg-secondary,#f9fafb)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Precio mensual</span>
                <span className="text-lg font-bold text-[var(--text-primary)]">
                  {calculatePrice(selectedPlan).toLocaleString('es-PY')} Gs
                </span>
              </div>
              {selectedPlan.first_month_discount > 0 && (
                <p className="mt-1 text-xs text-[var(--status-success,#16a34a)]">
                  Con {selectedPlan.first_month_discount}% de descuento el primer mes
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSubscribeModal(false)
                  resetForm()
                }}
                className="flex-1 rounded-lg border border-[var(--border-light,#e5e7eb)] px-4 py-2 font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubscribe}
                disabled={!selectedPetId || submitting}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Procesando...' : 'Confirmar Suscripción'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--bg-primary,#fff)] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedSubscription.plan.name}</h2>
                <p className="text-sm text-[var(--text-muted)]">{selectedSubscription.plan.service.name}</p>
              </div>
              <button
                onClick={() => setSelectedSubscription(null)}
                className="rounded-full p-2 text-[var(--text-muted)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status & Pet */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedSubscription.pet.species === 'dog' ? (
                  <Dog className="h-5 w-5 text-[var(--text-muted)]" />
                ) : (
                  <Cat className="h-5 w-5 text-[var(--text-muted)]" />
                )}
                <span className="font-medium text-[var(--text-primary)]">{selectedSubscription.pet.name}</span>
              </div>
              {getStatusBadge(selectedSubscription.status)}
            </div>

            {/* Details Grid */}
            <div className="mb-6 grid gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Precio actual</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {selectedSubscription.current_price.toLocaleString('es-PY')} Gs
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Próximo servicio</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {selectedSubscription.next_service_date
                    ? formatDate(selectedSubscription.next_service_date)
                    : 'Sin programar'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Servicios restantes</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {selectedSubscription.services_remaining_this_period}
                </span>
              </div>

              {selectedSubscription.preferred_day_of_week !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Día preferido</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {getDayName(selectedSubscription.preferred_day_of_week)}
                  </span>
                </div>
              )}

              {selectedSubscription.preferred_time_slot && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Horario preferido</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {getTimeSlotLabel(selectedSubscription.preferred_time_slot)}
                  </span>
                </div>
              )}
            </div>

            {/* Pickup/Delivery Info */}
            {(selectedSubscription.wants_pickup || selectedSubscription.wants_delivery) && (
              <div className="mb-6 rounded-lg bg-[var(--bg-secondary,#f9fafb)] p-4">
                <h4 className="mb-2 font-medium text-[var(--text-primary)]">Transporte</h4>
                {selectedSubscription.wants_pickup && selectedSubscription.pickup_address && (
                  <div className="mb-2 flex items-start gap-2 text-sm">
                    <Truck className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-[var(--text-muted)]">Recogida:</p>
                      <p className="text-[var(--text-secondary)]">{selectedSubscription.pickup_address}</p>
                    </div>
                  </div>
                )}
                {selectedSubscription.wants_delivery && selectedSubscription.delivery_address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="text-[var(--text-muted)]">Entrega:</p>
                      <p className="text-[var(--text-secondary)]">{selectedSubscription.delivery_address}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Instances */}
            {selectedSubscription.instances.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-[var(--text-primary)]">Servicios Recientes</h4>
                <div className="space-y-2">
                  {selectedSubscription.instances.slice(0, 5).map((instance) => (
                    <div
                      key={instance.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border-light,#e5e7eb)] p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {formatDate(instance.scheduled_date)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">{instance.status}</p>
                      </div>
                      {instance.customer_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{instance.customer_rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedSubscription.status !== 'cancelled' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedSubscription)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border-light,#e5e7eb)] px-4 py-2 font-medium text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary,#f3f4f6)]"
                >
                  {selectedSubscription.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Reanudar
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleCancel(selectedSubscription.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--status-error,#dc2626)] px-4 py-2 font-medium text-[var(--status-error,#dc2626)] transition hover:bg-[var(--status-error-bg,#fef2f2)]"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

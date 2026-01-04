'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Stethoscope, Loader2, PawPrint } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Pet {
  id: string
  name: string
  species: string
  breed: string | null
  owner_id: string
}

interface Client {
  id: string
  full_name: string
  email: string
  phone: string | null
  pets: Pet[]
}

interface StaffMember {
  id: string
  profile_id: string
  profiles: {
    full_name: string
  }
  specialization: string | null
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  base_price: number
  category: string
}

interface AppointmentFormProps {
  clinic: string
  onSuccess?: () => void
  onCancel?: () => void
  preselectedClientId?: string
  preselectedPetId?: string
}

export function AppointmentForm({
  clinic,
  onSuccess,
  onCancel,
  preselectedClientId,
  preselectedPetId,
}: AppointmentFormProps): React.ReactElement {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [clients, setClients] = useState<Client[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '')
  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId || '')
  const [vetId, setVetId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [duration, setDuration] = useState('30')
  const [startTime, setStartTime] = useState('')
  const [status, setStatus] = useState('confirmed')
  const [reason, setReason] = useState('Consulta General')
  const [notes, setNotes] = useState('')

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const supabase = createClient()

      const [clientsRes, staffRes, servicesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, email, phone, pets (id, name, species, breed, owner_id)')
          .eq('tenant_id', clinic)
          .eq('role', 'owner')
          .order('full_name'),
        supabase
          .from('staff_profiles')
          .select('id, profile_id, profiles (full_name), specialization')
          .eq('tenant_id', clinic),
        supabase
          .from('services')
          .select('id, name, duration_minutes, base_price, category')
          .eq('tenant_id', clinic)
          .eq('is_active', true)
          .order('category')
          .order('name'),
      ])

      setClients((clientsRes.data || []) as unknown as Client[])
      setStaff((staffRes.data || []) as unknown as StaffMember[])
      setServices((servicesRes.data || []) as Service[])
      setLoading(false)
    }

    fetchData()
  }, [clinic])

  // Get pets for selected client
  const availablePets = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)?.pets || []
    : clients.flatMap((c) => c.pets || [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No autorizado')
      }

      // Calculate end time
      const start = new Date(startTime)
      const end = new Date(start.getTime() + parseInt(duration) * 60000)

      // Create appointment
      const { error: insertError } = await supabase.from('appointments').insert({
        tenant_id: clinic,
        pet_id: selectedPetId,
        vet_id: vetId || null,
        service_id: serviceId || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: status,
        reason: reason,
        notes: notes || null,
        created_by: user.id,
      })

      if (insertError) {
        throw insertError
      }

      // Refresh and close
      router.refresh()
      onSuccess?.()
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating appointment:', err)
      }
      setError(err instanceof Error ? err.message : 'Error al crear la cita')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Get minimum datetime (now)
  const now = new Date()
  const minDateTime = now.toISOString().slice(0, 16)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Client & Pet Selection */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          <User className="h-4 w-4" />
          Paciente
        </h3>

        {/* Client Select */}
        <div>
          <label htmlFor="client_select" className="mb-1 block text-sm font-medium text-gray-600">
            Cliente
          </label>
          <select
            id="client_select"
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value)
              setSelectedPetId('')
            }}
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          >
            <option value="">Todos los clientes...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name} - {client.email}
              </option>
            ))}
          </select>
        </div>

        {/* Pet Select */}
        <div>
          <label htmlFor="pet_id" className="mb-1 block text-sm font-medium text-gray-600">
            Mascota *
          </label>
          <select
            id="pet_id"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            required
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          >
            <option value="">Seleccionar mascota...</option>
            {availablePets.map((pet) => {
              const owner = clients.find((c) => c.id === pet.owner_id)
              return (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species}) {owner ? `- ${owner.full_name}` : ''}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Vet Selection */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          <Stethoscope className="h-4 w-4" />
          Veterinario
        </h3>
        <select
          value={vetId}
          onChange={(e) => setVetId(e.target.value)}
          className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
        >
          <option value="">Sin asignar</option>
          {staff.map((s) => (
            <option key={s.id} value={s.profile_id}>
              {s.profiles?.full_name || 'Sin nombre'}
              {s.specialization && ` - ${s.specialization}`}
            </option>
          ))}
        </select>
      </div>

      {/* Service & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Servicio</label>
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value)
              const svc = services.find((s) => s.id === e.target.value)
              if (svc) setDuration(svc.duration_minutes.toString())
            }}
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          >
            <option value="">Sin servicio</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} - {formatPrice(s.base_price)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Duración</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          >
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hora</option>
            <option value="90">1.5 horas</option>
            <option value="120">2 horas</option>
          </select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Fecha y Hora *</label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              min={minDateTime}
              className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-[var(--primary)] focus:ring-2"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
          </select>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">Motivo *</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
        >
          <option value="Consulta General">Consulta General</option>
          <option value="Vacunación">Vacunación</option>
          <option value="Control">Control / Seguimiento</option>
          <option value="Desparasitación">Desparasitación</option>
          <option value="Cirugía">Cirugía</option>
          <option value="Emergencia">Emergencia</option>
          <option value="Grooming">Grooming / Estética</option>
          <option value="Laboratorio">Laboratorio</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Información adicional..."
          className="focus:ring-[var(--primary)]/20 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-xl px-4 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !selectedPetId || !startTime}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Crear Cita
            </>
          )}
        </button>
      </div>
    </form>
  )
}

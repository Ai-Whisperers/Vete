'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PawPrint,
  User,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  full_name: string
  email: string
  phone?: string
}

interface PetQuickAddFormProps {
  clinic: string
  preselectedClientId?: string
  onSuccess?: (petId: string) => void
  onCancel?: () => void
}

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'rabbit', label: 'Conejo' },
  { value: 'hamster', label: 'Hámster' },
  { value: 'fish', label: 'Pez' },
  { value: 'reptile', label: 'Reptil' },
  { value: 'other', label: 'Otro' },
]

const SEX_OPTIONS = [
  { value: 'male', label: 'Macho' },
  { value: 'female', label: 'Hembra' },
  { value: 'unknown', label: 'Desconocido' },
]

export function PetQuickAddForm({
  clinic,
  preselectedClientId,
  onSuccess,
  onCancel,
}: PetQuickAddFormProps): React.ReactElement {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  // Form state
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || '')
  const [selectedClientName, setSelectedClientName] = useState('')
  const [petName, setPetName] = useState('')
  const [species, setSpecies] = useState('dog')
  const [breed, setBreed] = useState('')
  const [sex, setSex] = useState('unknown')
  const [birthDate, setBirthDate] = useState('')
  const [weight, setWeight] = useState('')
  const [microchipNumber, setMicrochipNumber] = useState('')
  const [notes, setNotes] = useState('')

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async (): Promise<void> => {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('tenant_id', clinic)
        .eq('role', 'owner')
        .order('full_name')

      if (fetchError) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching clients:', fetchError)
        }
        setError('Error al cargar clientes')
      } else {
        setClients((data || []) as Client[])

        // If preselected, set the name
        if (preselectedClientId) {
          const client = data?.find((c) => c.id === preselectedClientId)
          if (client) {
            setSelectedClientName(client.full_name)
          }
        }
      }
      setLoading(false)
    }

    fetchClients()
  }, [clinic, preselectedClientId])

  // Filter clients based on search
  const filteredClients = clients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
  )

  const handleClientSelect = (client: Client): void => {
    setSelectedClientId(client.id)
    setSelectedClientName(client.full_name)
    setClientSearch('')
    setShowClientDropdown(false)
  }

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

      if (!selectedClientId) {
        throw new Error('Debe seleccionar un propietario')
      }

      if (!petName.trim()) {
        throw new Error('Debe ingresar el nombre de la mascota')
      }

      // Create pet record
      const { data: newPet, error: insertError } = await supabase
        .from('pets')
        .insert({
          tenant_id: clinic,
          owner_id: selectedClientId,
          name: petName.trim(),
          species,
          breed: breed.trim() || null,
          sex,
          birth_date: birthDate || null,
          weight: weight ? parseFloat(weight) : null,
          microchip_number: microchipNumber.trim() || null,
          notes: notes.trim() || null,
        })
        .select('id')
        .single()

      if (insertError) {
        // Client-side error logging - only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Pet insert error:', insertError)
        }
        throw new Error('Error al registrar la mascota')
      }

      setSuccess(true)
      router.refresh()

      // Auto-close after success
      setTimeout(() => {
        onSuccess?.(newPet.id)
      }, 1500)
    } catch (err) {
      // Client-side error logging - only in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating pet:', err)
      }
      setError(err instanceof Error ? err.message : 'Error al registrar mascota')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--status-success-bg)]">
          <CheckCircle className="h-8 w-8 text-[var(--status-success)]" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-[var(--status-success-text)]">Mascota Registrada</h2>
        <p className="text-[var(--status-success-text)]">La mascota ha sido agregada exitosamente.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[var(--status-error-border)] bg-[var(--status-error-bg)] p-4 text-sm text-[var(--status-error-text)]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Owner Selection */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          <User className="h-4 w-4" />
          Propietario
        </h3>

        <div className="relative">
          <label htmlFor="clientSearch" className="mb-1 block text-sm font-medium text-gray-600">
            Buscar Cliente *
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              id="clientSearch"
              type="text"
              value={selectedClientName || clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value)
                setSelectedClientId('')
                setSelectedClientName('')
                setShowClientDropdown(true)
              }}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Buscar por nombre o email..."
              className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 py-3 pl-12 pr-10 outline-none focus:border-[var(--primary)] focus:ring-2"
            />
            <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Dropdown */}
          {showClientDropdown && !selectedClientId && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
              {filteredClients.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No se encontraron clientes</div>
              ) : (
                filteredClients.slice(0, 10).map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50"
                  >
                    <p className="font-medium text-gray-900">{client.full_name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pet Info */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
          <PawPrint className="h-4 w-4" />
          Información de la Mascota
        </h3>

        <div>
          <label htmlFor="petName" className="mb-1 block text-sm font-medium text-gray-600">
            Nombre *
          </label>
          <input
            id="petName"
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
            placeholder="Max, Luna, etc."
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="species" className="mb-1 block text-sm font-medium text-gray-600">
              Especie *
            </label>
            <select
              id="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
              className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
            >
              {SPECIES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sex" className="mb-1 block text-sm font-medium text-gray-600">
              Sexo
            </label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
            >
              {SEX_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="breed" className="mb-1 block text-sm font-medium text-gray-600">
            Raza
          </label>
          <input
            id="breed"
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="Golden Retriever, Siamés, etc."
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="birthDate" className="mb-1 block text-sm font-medium text-gray-600">
              Fecha de Nacimiento
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:border-[var(--primary)] focus:ring-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor="weight" className="mb-1 block text-sm font-medium text-gray-600">
              Peso (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="microchipNumber" className="mb-1 block text-sm font-medium text-gray-600">
            Número de Microchip
          </label>
          <input
            id="microchipNumber"
            type="text"
            value={microchipNumber}
            onChange={(e) => setMicrochipNumber(e.target.value)}
            placeholder="123456789012345"
            className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-600">
            Notas
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Alergias, condiciones especiales, etc."
            className="focus:ring-[var(--primary)]/20 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[var(--primary)] focus:ring-2"
          />
        </div>
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
          disabled={isSubmitting || !selectedClientId || !petName.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <PawPrint className="h-4 w-4" />
              Registrar Mascota
            </>
          )}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Heart,
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  CheckCircle,
  Dog,
  Cat,
  Rabbit,
  Bird,
  PawPrint,
  Sparkles,
  DollarSign,
  ChevronDown,
  Home,
  Users,
  Activity,
} from 'lucide-react'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  sex: string
  birth_date: string
  color: string
  photo_url: string
  photos: string[]
  weight_kg: number
}

interface AdoptionListing {
  id: string
  status: 'available' | 'pending' | 'adopted' | 'withdrawn'
  story: string
  personality: string
  requirements: string
  adoption_fee: number
  includes_vaccines: boolean
  includes_neutering: boolean
  includes_microchip: boolean
  good_with_kids: boolean | null
  good_with_dogs: boolean | null
  good_with_cats: boolean | null
  energy_level: 'low' | 'medium' | 'high' | null
  special_needs: string | null
  featured: boolean
  views_count: number
  listed_at: string
  pet: Pet
}

interface Props {
  clinicSlug: string
  clinicConfig: {
    name: string
  }
}

const speciesIcons: Record<string, React.ReactNode> = {
  dog: <Dog className="h-5 w-5" />,
  cat: <Cat className="h-5 w-5" />,
  rabbit: <Rabbit className="h-5 w-5" />,
  bird: <Bird className="h-5 w-5" />,
  other: <PawPrint className="h-5 w-5" />,
}

export function AdoptionBoard({ clinicSlug, clinicConfig }: Props) {
  const [listings, setListings] = useState<AdoptionListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<AdoptionListing | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [filters, setFilters] = useState({
    species: '',
    energyLevel: '',
    goodWithKids: false,
    goodWithDogs: false,
    goodWithCats: false,
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: 'available', limit: '50' })
      if (filters.species) params.set('species', filters.species)

      const response = await fetch(`/api/adoptions?${params}`, {
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to fetch')

      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Error fetching adoptions:', error)
    } finally {
      setLoading(false)
    }
  }, [filters.species])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Client-side filters
  const filteredListings = listings.filter((listing) => {
    if (filters.goodWithKids && !listing.good_with_kids) return false
    if (filters.goodWithDogs && !listing.good_with_dogs) return false
    if (filters.goodWithCats && !listing.good_with_cats) return false
    if (filters.energyLevel && listing.energy_level !== filters.energyLevel) return false
    return true
  })

  // Sort by featured first
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime()
  })

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()

    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''}`
    }
    return `${months > 0 ? months : 1} mes${months > 1 ? 'es' : ''}`
  }

  const energyLabels = {
    low: 'Tranquilo',
    medium: 'Moderado',
    high: 'Muy activo',
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] py-16 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12" />
          <h1 className="mb-3 text-4xl font-bold">Adopta un Amigo</h1>
          <p className="mx-auto max-w-2xl text-lg opacity-90">
            Dale un hogar a una mascota que lo necesita. Todos nuestros animales están
            vacunados, esterilizados y listos para ser parte de tu familia.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-0 z-10 border-b border-[var(--border-default)] bg-[var(--bg-paper)] shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Species Quick Filters */}
            <div className="flex gap-2">
              {[
                { value: '', label: 'Todos', icon: <PawPrint className="h-4 w-4" /> },
                { value: 'dog', label: 'Perros', icon: <Dog className="h-4 w-4" /> },
                { value: 'cat', label: 'Gatos', icon: <Cat className="h-4 w-4" /> },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, species: option.value })}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filters.species === option.value
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>

            {/* More Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)]"
            >
              <Filter className="h-4 w-4" />
              Más filtros
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--border-default)] pt-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.goodWithKids}
                  onChange={(e) => setFilters({ ...filters, goodWithKids: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Bueno con niños</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.goodWithDogs}
                  onChange={(e) => setFilters({ ...filters, goodWithDogs: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Bueno con perros</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.goodWithCats}
                  onChange={(e) => setFilters({ ...filters, goodWithCats: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Bueno con gatos</span>
              </label>

              <select
                value={filters.energyLevel}
                onChange={(e) => setFilters({ ...filters, energyLevel: e.target.value })}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
              >
                <option value="">Cualquier energía</option>
                <option value="low">Tranquilo</option>
                <option value="medium">Moderado</option>
                <option value="high">Muy activo</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl bg-[var(--bg-subtle)]" />
            ))}
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
              <PawPrint className="h-10 w-10 text-[var(--text-muted)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              No hay mascotas disponibles
            </h2>
            <p className="mt-2 max-w-md text-[var(--text-secondary)]">
              No encontramos mascotas que coincidan con tus filtros. Prueba ajustando los criterios
              o vuelve pronto para ver nuevos amigos.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedListings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => setSelectedListing(listing)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-paper)] shadow-sm transition-all hover:shadow-lg"
              >
                {/* Pet Photo */}
                <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
                  {listing.pet.photo_url ? (
                    <img
                      src={listing.pet.photo_url}
                      alt={listing.pet.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {speciesIcons[listing.pet.species] || speciesIcons.other}
                    </div>
                  )}

                  {/* Featured Badge */}
                  {listing.featured && (
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[var(--status-warning,#f59e0b)] px-3 py-1 text-xs font-bold text-white">
                      <Sparkles className="h-3 w-3" />
                      Destacado
                    </div>
                  )}

                  {/* Species Icon */}
                  <div className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 text-[var(--text-primary)] shadow">
                    {speciesIcons[listing.pet.species] || speciesIcons.other}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {listing.pet.name}
                    </h3>
                    {listing.adoption_fee > 0 ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)]">
                        <DollarSign className="h-4 w-4" />
                        {listing.adoption_fee.toLocaleString()} Gs
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--status-success-bg,#dcfce7)] px-2 py-0.5 text-xs font-medium text-[var(--status-success,#22c55e)]">
                        Gratis
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[var(--text-secondary)]">
                    {listing.pet.breed || listing.pet.species} • {listing.pet.sex === 'male' ? 'Macho' : 'Hembra'} •{' '}
                    {listing.pet.birth_date ? calculateAge(listing.pet.birth_date) : 'Edad desconocida'}
                  </p>

                  {/* Quick Compatibility */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {listing.good_with_kids && (
                      <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                        👶 Niños
                      </span>
                    )}
                    {listing.good_with_dogs && (
                      <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                        🐕 Perros
                      </span>
                    )}
                    {listing.good_with_cats && (
                      <span className="rounded-full bg-[var(--bg-subtle)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                        🐱 Gatos
                      </span>
                    )}
                  </div>

                  {/* Includes */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-[var(--status-success,#22c55e)]">
                    {listing.includes_vaccines && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Vacunas
                      </span>
                    )}
                    {listing.includes_neutering && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Esterilizado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onApply={() => {
            setShowApplicationModal(true)
          }}
          calculateAge={calculateAge}
          energyLabels={energyLabels}
        />
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedListing && (
        <ApplicationModal
          listing={selectedListing}
          onClose={() => {
            setShowApplicationModal(false)
            setSelectedListing(null)
          }}
          onSuccess={() => {
            setShowApplicationModal(false)
            setSelectedListing(null)
            alert('¡Solicitud enviada! Nos pondremos en contacto contigo pronto.')
          }}
        />
      )}
    </div>
  )
}

// Detail Modal Component
function ListingDetailModal({
  listing,
  onClose,
  onApply,
  calculateAge,
  energyLabels,
}: {
  listing: AdoptionListing
  onClose: () => void
  onApply: () => void
  calculateAge: (date: string) => string
  energyLabels: Record<string, string>
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[var(--bg-paper)] shadow-xl">
        {/* Photo Header */}
        <div className="relative aspect-video bg-[var(--bg-subtle)]">
          {listing.pet.photo_url ? (
            <img
              src={listing.pet.photo_url}
              alt={listing.pet.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PawPrint className="h-24 w-24 text-[var(--text-muted)]" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {listing.pet.name}
              </h2>
              <p className="text-[var(--text-secondary)]">
                {listing.pet.breed || listing.pet.species} • {listing.pet.sex === 'male' ? 'Macho' : 'Hembra'} •{' '}
                {listing.pet.birth_date ? calculateAge(listing.pet.birth_date) : 'Edad desconocida'}
              </p>
            </div>
            {listing.adoption_fee > 0 ? (
              <div className="text-right">
                <p className="text-sm text-[var(--text-muted)]">Cuota de adopción</p>
                <p className="text-xl font-bold text-[var(--primary)]">
                  {listing.adoption_fee.toLocaleString()} Gs
                </p>
              </div>
            ) : (
              <span className="rounded-full bg-[var(--status-success-bg,#dcfce7)] px-4 py-1 font-medium text-[var(--status-success,#22c55e)]">
                Adopción gratuita
              </span>
            )}
          </div>

          {/* Includes Section */}
          <div className="mb-6 rounded-xl bg-[var(--bg-subtle)] p-4">
            <h3 className="mb-2 font-medium text-[var(--text-primary)]">La adopción incluye</h3>
            <div className="flex flex-wrap gap-4">
              {listing.includes_vaccines && (
                <div className="flex items-center gap-2 text-[var(--status-success,#22c55e)]">
                  <CheckCircle className="h-5 w-5" />
                  <span>Vacunas al día</span>
                </div>
              )}
              {listing.includes_neutering && (
                <div className="flex items-center gap-2 text-[var(--status-success,#22c55e)]">
                  <CheckCircle className="h-5 w-5" />
                  <span>Esterilización</span>
                </div>
              )}
              {listing.includes_microchip && (
                <div className="flex items-center gap-2 text-[var(--status-success,#22c55e)]">
                  <CheckCircle className="h-5 w-5" />
                  <span>Microchip</span>
                </div>
              )}
            </div>
          </div>

          {/* Compatibility */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-default)] p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-[var(--text-muted)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Con niños</p>
              <p className={`text-sm ${listing.good_with_kids ? 'text-[var(--status-success,#22c55e)]' : 'text-[var(--text-muted)]'}`}>
                {listing.good_with_kids === true ? 'Sí' : listing.good_with_kids === false ? 'No recomendado' : 'No evaluado'}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] p-4 text-center">
              <Dog className="mx-auto mb-2 h-6 w-6 text-[var(--text-muted)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Con perros</p>
              <p className={`text-sm ${listing.good_with_dogs ? 'text-[var(--status-success,#22c55e)]' : 'text-[var(--text-muted)]'}`}>
                {listing.good_with_dogs === true ? 'Sí' : listing.good_with_dogs === false ? 'No recomendado' : 'No evaluado'}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] p-4 text-center">
              <Cat className="mx-auto mb-2 h-6 w-6 text-[var(--text-muted)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">Con gatos</p>
              <p className={`text-sm ${listing.good_with_cats ? 'text-[var(--status-success,#22c55e)]' : 'text-[var(--text-muted)]'}`}>
                {listing.good_with_cats === true ? 'Sí' : listing.good_with_cats === false ? 'No recomendado' : 'No evaluado'}
              </p>
            </div>
          </div>

          {/* Energy Level */}
          {listing.energy_level && (
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-[var(--text-primary)]">Nivel de energía</h3>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-[var(--text-secondary)]">
                  {energyLabels[listing.energy_level]}
                </span>
              </div>
            </div>
          )}

          {/* Story */}
          {listing.story && (
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-[var(--text-primary)]">Su historia</h3>
              <p className="text-[var(--text-secondary)]">{listing.story}</p>
            </div>
          )}

          {/* Personality */}
          {listing.personality && (
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-[var(--text-primary)]">Personalidad</h3>
              <p className="text-[var(--text-secondary)]">{listing.personality}</p>
            </div>
          )}

          {/* Requirements */}
          {listing.requirements && (
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-[var(--text-primary)]">Requisitos de adopción</h3>
              <p className="text-[var(--text-secondary)]">{listing.requirements}</p>
            </div>
          )}

          {/* Special Needs */}
          {listing.special_needs && (
            <div className="mb-6 rounded-xl border border-[var(--status-warning,#f59e0b)] bg-[var(--status-warning-bg,#fffbeb)] p-4">
              <h3 className="mb-2 font-medium text-[var(--status-warning-dark,#b45309)]">
                Necesidades especiales
              </h3>
              <p className="text-[var(--text-secondary)]">{listing.special_needs}</p>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={onApply}
            className="w-full rounded-xl bg-[var(--primary)] py-4 text-lg font-medium text-white transition-colors hover:bg-[var(--primary-dark)]"
          >
            <Heart className="mr-2 inline h-5 w-5" />
            Solicitar Adopción
          </button>
        </div>
      </div>
    </div>
  )
}

// Application Modal Component
function ApplicationModal({
  listing,
  onClose,
  onSuccess,
}: {
  listing: AdoptionListing
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    living_situation: '',
    has_yard: false,
    yard_fenced: false,
    own_or_rent: '',
    landlord_allows_pets: null as boolean | null,
    household_members: 1,
    has_children: false,
    children_ages: '',
    other_pets: '',
    pet_experience: '',
    reason_for_adoption: '',
    hours_alone: 0,
    exercise_plan: '',
    emergency_plan: '',
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/adoptions/${listing.id}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al enviar')
      }

      onSuccess()
    } catch (error) {
      console.error('Error submitting application:', error)
      alert(error instanceof Error ? error.message : 'Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[var(--bg-paper)] shadow-xl">
        <div className="border-b border-[var(--border-default)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Solicitud de Adopción
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Adoptar a {listing.pet.name} - Paso {step} de 3
          </p>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[var(--text-primary)]">Información Personal</h3>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Nombre completo <span className="text-[var(--status-error,#ef4444)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.applicant_name}
                  onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                    Email <span className="text-[var(--status-error,#ef4444)]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.applicant_email}
                    onChange={(e) => setFormData({ ...formData, applicant_email: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                    Teléfono <span className="text-[var(--status-error,#ef4444)]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.applicant_phone}
                    onChange={(e) => setFormData({ ...formData, applicant_phone: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[var(--text-primary)]">Tu Hogar</h3>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Tipo de vivienda <span className="text-[var(--status-error,#ef4444)]">*</span>
                </label>
                <select
                  value={formData.living_situation}
                  onChange={(e) => setFormData({ ...formData, living_situation: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="house">Casa</option>
                  <option value="apartment">Departamento</option>
                  <option value="farm">Chacra/Finca</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-default)] p-3">
                  <input
                    type="checkbox"
                    checked={formData.has_yard}
                    onChange={(e) => setFormData({ ...formData, has_yard: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Tengo patio</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border-default)] p-3">
                  <input
                    type="checkbox"
                    checked={formData.yard_fenced}
                    onChange={(e) => setFormData({ ...formData, yard_fenced: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-[var(--text-primary)]">Patio cercado</span>
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  ¿Propietario o inquilino?
                </label>
                <select
                  value={formData.own_or_rent}
                  onChange={(e) => setFormData({ ...formData, own_or_rent: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="own">Propietario</option>
                  <option value="rent">Inquilino</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Miembros del hogar
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.household_members}
                  onChange={(e) => setFormData({ ...formData, household_members: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Otras mascotas en el hogar
                </label>
                <textarea
                  value={formData.other_pets}
                  onChange={(e) => setFormData({ ...formData, other_pets: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                  rows={2}
                  placeholder="Describe las mascotas que ya tienes (si aplica)"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium text-[var(--text-primary)]">Motivación y Plan</h3>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  ¿Por qué quieres adoptar? <span className="text-[var(--status-error,#ef4444)]">*</span>
                </label>
                <textarea
                  value={formData.reason_for_adoption}
                  onChange={(e) => setFormData({ ...formData, reason_for_adoption: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Experiencia previa con mascotas
                </label>
                <textarea
                  value={formData.pet_experience}
                  onChange={(e) => setFormData({ ...formData, pet_experience: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                  rows={2}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  Horas al día que la mascota estaría sola
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={formData.hours_alone}
                  onChange={(e) => setFormData({ ...formData, hours_alone: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                  ¿Qué harías si ya no pudieras cuidarla?
                </label>
                <textarea
                  value={formData.emergency_plan}
                  onChange={(e) => setFormData({ ...formData, emergency_plan: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-paper)] px-4 py-2 text-[var(--text-primary)]"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-3 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]"
              >
                Anterior
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.applicant_name || !formData.applicant_email || !formData.applicant_phone)) ||
                  (step === 2 && !formData.living_situation)
                }
                className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-50"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.reason_for_adoption}
                className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

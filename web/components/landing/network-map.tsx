'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Search,
  Navigation,
  Clock,
  Phone,
  ExternalLink,
  Star,
  Filter,
  ChevronDown,
  X,
  Building2,
  Stethoscope,
  Syringe,
  TestTube,
} from 'lucide-react'
import { getWhatsAppUrl, landingMessages } from '@/lib/whatsapp'

interface ClinicLocation {
  id: string
  name: string
  address: string
  city: string
  neighborhood: string
  coordinates: { lat: number; lng: number }
  phone: string
  hours: {
    weekdays: string
    saturday: string
    sunday: string
  }
  specialties: string[]
  rating: number
  isOpen?: boolean
  distance?: string
  emergency24h: boolean
}

// Clinic data
const clinicLocations: ClinicLocation[] = [
  {
    id: 'adris',
    name: 'Veterinaria Adris',
    address: 'Av. Santa Teresa 1234',
    city: 'Asuncion',
    neighborhood: 'Villa Morra',
    coordinates: { lat: -25.2637, lng: -57.5759 },
    phone: '+595 981 123 456',
    hours: {
      weekdays: '08:00 - 20:00',
      saturday: '08:00 - 18:00',
      sunday: 'Urgencias 24hs',
    },
    specialties: ['Clinica General', 'Urgencias', 'Cirugia', 'Vacunacion'],
    rating: 4.9,
    emergency24h: true,
  },
  {
    id: 'petlife',
    name: 'PetLife Center',
    address: 'Ruta 2 Km 14',
    city: 'Mariano Roque Alonso',
    neighborhood: 'Centro',
    coordinates: { lat: -25.215, lng: -57.518 },
    phone: '+595 971 999 888',
    hours: {
      weekdays: '07:00 - 19:00',
      saturday: '08:00 - 14:00',
      sunday: 'Cerrado',
    },
    specialties: ['Diagnostico', 'Ecografia', 'Radiologia', 'Laboratorio'],
    rating: 4.8,
    emergency24h: false,
  },
]

const specialtyIcons: Record<string, React.ElementType> = {
  'Clinica General': Stethoscope,
  Urgencias: Clock,
  Cirugia: Stethoscope,
  Vacunacion: Syringe,
  Diagnostico: TestTube,
  Ecografia: TestTube,
  Radiologia: TestTube,
  Laboratorio: TestTube,
}

const allCities = [...new Set(clinicLocations.map((c) => c.city))]
const allSpecialties = [...new Set(clinicLocations.flatMap((c) => c.specialties))]

function ClinicListItem({
  clinic,
  isSelected,
  onClick,
}: {
  clinic: ClinicLocation
  isSelected: boolean
  onClick: () => void
}) {
  // Check if currently open (simplified logic)
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  const isWeekday = day >= 1 && day <= 5
  const isSaturday = day === 6

  let isOpen = false
  if (isWeekday) {
    const [open, close] = clinic.hours.weekdays.split(' - ').map((t) => parseInt(t.split(':')[0]))
    isOpen = hour >= open && hour < close
  } else if (isSaturday) {
    const [open, close] = clinic.hours.saturday.split(' - ').map((t) => parseInt(t.split(':')[0]))
    isOpen = hour >= open && hour < close
  } else if (clinic.emergency24h) {
    isOpen = true
  }

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl p-4 text-left transition-all ${
        isSelected
          ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 border-2'
          : 'border border-white/10 bg-white/5 hover:border-white/20'
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h4 className="font-bold text-white">{clinic.name}</h4>
          <p className="flex items-center gap-1 text-sm text-white/50">
            <MapPin className="h-3 w-3" />
            {clinic.neighborhood}, {clinic.city}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-[var(--primary)] text-[var(--primary)]" />
            <span className="text-sm font-bold text-white">{clinic.rating}</span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {isOpen ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {clinic.specialties.slice(0, 3).map((spec, idx) => (
          <span key={idx} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">
            {spec}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">
          <Clock className="mr-1 inline h-3 w-3" />
          {isWeekday
            ? clinic.hours.weekdays
            : isSaturday
              ? clinic.hours.saturday
              : clinic.hours.sunday}
        </span>
        {clinic.emergency24h && (
          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-400">24hs</span>
        )}
      </div>
    </button>
  )
}

function ClinicDetailPanel({ clinic, onClose }: { clinic: ClinicLocation; onClose: () => void }) {
  return (
    <div className="bg-[var(--bg-dark)]/95 absolute inset-0 z-20 overflow-y-auto p-4 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="pt-8">
        <h3 className="mb-2 text-2xl font-bold text-white">{clinic.name}</h3>
        <p className="mb-6 flex items-center gap-1 text-white/50">
          <MapPin className="h-4 w-4" />
          {clinic.address}, {clinic.city}
        </p>

        {/* Rating */}
        <div className="mb-6 flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < Math.floor(clinic.rating) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-white/20'}`}
            />
          ))}
          <span className="font-bold text-white">{clinic.rating}</span>
        </div>

        {/* Hours */}
        <div className="mb-6">
          <h4 className="mb-2 flex items-center gap-2 font-bold text-white">
            <Clock className="h-4 w-4 text-[var(--primary)]" />
            Horarios
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Lun - Vie</span>
              <span className="text-white">{clinic.hours.weekdays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Sabado</span>
              <span className="text-white">{clinic.hours.saturday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Domingo</span>
              <span className="text-white">{clinic.hours.sunday}</span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-6">
          <h4 className="mb-2 font-bold text-white">Especialidades</h4>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.map((spec, idx) => {
              const Icon = specialtyIcons[spec] || Stethoscope
              return (
                <span
                  key={idx}
                  className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm text-white/70"
                >
                  <Icon className="h-3 w-3" />
                  {spec}
                </span>
              )
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h4 className="mb-2 flex items-center gap-2 font-bold text-white">
            <Phone className="h-4 w-4 text-[var(--primary)]" />
            Contacto
          </h4>
          <a
            href={`tel:${clinic.phone.replace(/\s/g, '')}`}
            className="text-[var(--primary)] hover:underline"
          >
            {clinic.phone}
          </a>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/${clinic.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-4 py-3 font-bold text-[var(--bg-dark)]"
          >
            Visitar Sitio
            <ExternalLink className="h-4 w-4" />
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 font-bold text-white transition-all hover:bg-white/20"
          >
            <Navigation className="h-4 w-4" />
            Como Llegar
          </a>
        </div>
      </div>
    </div>
  )
}

export function NetworkMap() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredClinics = useMemo(() => {
    return clinicLocations.filter((clinic) => {
      const matchesSearch =
        searchQuery === '' ||
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.neighborhood.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCity = !selectedCity || clinic.city === selectedCity
      const matchesSpecialty = !selectedSpecialty || clinic.specialties.includes(selectedSpecialty)

      return matchesSearch && matchesCity && matchesSpecialty
    })
  }, [searchQuery, selectedCity, selectedSpecialty])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCity(null)
    setSelectedSpecialty(null)
  }

  const hasActiveFilters = searchQuery || selectedCity || selectedSpecialty

  return (
    <section
      id="mapa"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--bg-dark)] to-[var(--bg-dark-alt)] py-20 md:py-28"
    >
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            Encuentra tu Veterinaria
          </span>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            Red de Clinicas Vetic
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Busca la clinica mas cercana a vos. Todas con el mismo nivel de tecnologia y
            profesionalismo.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mx-auto mb-8 max-w-4xl">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad o barrio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:border-[var(--primary)]/50 w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/40 transition-all focus:outline-none"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filtros
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap gap-4">
                {/* City Filter */}
                <div className="min-w-[200px] flex-1">
                  <label className="mb-2 block text-sm text-white/50">Ciudad</label>
                  <select
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value || null)}
                    className="focus:border-[var(--primary)]/50 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none"
                  >
                    <option value="">Todas las ciudades</option>
                    {allCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialty Filter */}
                <div className="min-w-[200px] flex-1">
                  <label className="mb-2 block text-sm text-white/50">Especialidad</label>
                  <select
                    value={selectedSpecialty || ''}
                    onChange={(e) => setSelectedSpecialty(e.target.value || null)}
                    className="focus:border-[var(--primary)]/50 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:outline-none"
                  >
                    <option value="">Todas las especialidades</option>
                    {allSpecialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="self-end px-4 py-2 text-white/60 transition-colors hover:text-white"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map and List Container */}
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {/* Clinic List */}
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-white">
                {filteredClinics.length}{' '}
                {filteredClinics.length === 1 ? 'clinica encontrada' : 'clinicas encontradas'}
              </h3>
            </div>

            <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {filteredClinics.length > 0 ? (
                filteredClinics.map((clinic) => (
                  <ClinicListItem
                    key={clinic.id}
                    clinic={clinic}
                    isSelected={selectedClinic?.id === clinic.id}
                    onClick={() => setSelectedClinic(clinic)}
                  />
                ))
              ) : (
                <div className="py-12 text-center">
                  <MapPin className="mx-auto mb-4 h-12 w-12 text-white/20" />
                  <p className="text-white/50">No se encontraron clinicas con esos criterios.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[var(--primary)] hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#1a2744] lg:aspect-auto lg:h-[500px]">
              {/* Static map background with markers */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simple visual map representation */}
                <div className="relative h-full w-full">
                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                      backgroundSize: '40px 40px',
                    }}
                  />

                  {/* Clinic markers */}
                  {filteredClinics.map((clinic, idx) => {
                    // Position markers relatively in the container
                    const positions = [
                      { top: '35%', left: '45%' },
                      { top: '55%', left: '60%' },
                    ]
                    const pos = positions[idx] || { top: '50%', left: '50%' }

                    return (
                      <button
                        key={clinic.id}
                        onClick={() => setSelectedClinic(clinic)}
                        className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 transform transition-all ${
                          selectedClinic?.id === clinic.id ? 'scale-125' : 'hover:scale-110'
                        }`}
                        style={{ top: pos.top, left: pos.left }}
                      >
                        <div
                          className={`relative ${selectedClinic?.id === clinic.id ? 'animate-pulse' : ''}`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${
                              selectedClinic?.id === clinic.id
                                ? 'bg-[var(--primary)]'
                                : 'bg-[var(--secondary)]'
                            }`}
                          >
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          {/* Pulse effect */}
                          <div
                            className={`absolute inset-0 animate-ping rounded-full opacity-20 ${
                              selectedClinic?.id === clinic.id
                                ? 'bg-[var(--primary)]'
                                : 'bg-[var(--secondary)]'
                            }`}
                          />
                        </div>
                        {/* Label */}
                        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap">
                          <span className="bg-[var(--bg-dark)]/90 rounded px-2 py-1 text-xs font-medium text-white">
                            {clinic.name}
                          </span>
                        </div>
                      </button>
                    )
                  })}

                  {/* Paraguay outline hint */}
                  <div className="absolute inset-4 rounded-3xl border-2 border-dashed border-white/5" />

                  {/* Asuncion label */}
                  <div className="absolute left-1/3 top-1/4 text-sm font-medium text-white/20">
                    Asuncion
                  </div>
                </div>
              </div>

              {/* Selected clinic detail overlay */}
              {selectedClinic && (
                <ClinicDetailPanel
                  clinic={selectedClinic}
                  onClose={() => setSelectedClinic(null)}
                />
              )}

              {/* No selection hint */}
              {!selectedClinic && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-sm text-white/40">Selecciona una clinica para ver detalles</p>
                </div>
              )}
            </div>

            {/* Open in Google Maps */}
            <div className="mt-4 text-center">
              <a
                href="https://www.google.com/maps/search/veterinaria+Vetic+paraguay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-[var(--primary)]"
              >
                <Navigation className="h-4 w-4" />
                Ver en Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Pet Owner CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-white/50">¿Tu veterinaria favorita no esta en la red?</p>
          <a
            href={getWhatsAppUrl('Hola! Me gustaria que mi veterinaria use Vetic')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 font-medium text-white transition-all hover:bg-white/10"
          >
            Recomendala
          </a>
        </div>
      </div>
    </section>
  )
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin, Search, Navigation, Clock, Phone,
  ExternalLink, Star, Filter, ChevronDown, X,
  Building2, Stethoscope, Syringe, TestTube
} from 'lucide-react';

interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  specialties: string[];
  rating: number;
  isOpen?: boolean;
  distance?: string;
  emergency24h: boolean;
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
      sunday: 'Urgencias 24hs'
    },
    specialties: ['Clinica General', 'Urgencias', 'Cirugia', 'Vacunacion'],
    rating: 4.9,
    emergency24h: true
  },
  {
    id: 'petlife',
    name: 'PetLife Center',
    address: 'Ruta 2 Km 14',
    city: 'Mariano Roque Alonso',
    neighborhood: 'Centro',
    coordinates: { lat: -25.2150, lng: -57.5180 },
    phone: '+595 971 999 888',
    hours: {
      weekdays: '07:00 - 19:00',
      saturday: '08:00 - 14:00',
      sunday: 'Cerrado'
    },
    specialties: ['Diagnostico', 'Ecografia', 'Radiologia', 'Laboratorio'],
    rating: 4.8,
    emergency24h: false
  }
];

const specialtyIcons: Record<string, React.ElementType> = {
  'Clinica General': Stethoscope,
  'Urgencias': Clock,
  'Cirugia': Stethoscope,
  'Vacunacion': Syringe,
  'Diagnostico': TestTube,
  'Ecografia': TestTube,
  'Radiologia': TestTube,
  'Laboratorio': TestTube
};

const allCities = [...new Set(clinicLocations.map(c => c.city))];
const allSpecialties = [...new Set(clinicLocations.flatMap(c => c.specialties))];

function ClinicListItem({ clinic, isSelected, onClick }: {
  clinic: ClinicLocation;
  isSelected: boolean;
  onClick: () => void;
}) {
  // Check if currently open (simplified logic)
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const isSaturday = day === 6;

  let isOpen = false;
  if (isWeekday) {
    const [open, close] = clinic.hours.weekdays.split(' - ').map(t => parseInt(t.split(':')[0]));
    isOpen = hour >= open && hour < close;
  } else if (isSaturday) {
    const [open, close] = clinic.hours.saturday.split(' - ').map(t => parseInt(t.split(':')[0]));
    isOpen = hour >= open && hour < close;
  } else if (clinic.emergency24h) {
    isOpen = true;
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isSelected
          ? 'bg-[#2DCEA3]/10 border-2 border-[#2DCEA3]/30'
          : 'bg-white/5 border border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-white font-bold">{clinic.name}</h4>
          <p className="text-white/50 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {clinic.neighborhood}, {clinic.city}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-[#2DCEA3] fill-[#2DCEA3]" />
            <span className="text-white text-sm font-bold">{clinic.rating}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            isOpen
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {isOpen ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {clinic.specialties.slice(0, 3).map((spec, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-white/5 rounded-full text-white/50 text-xs">
            {spec}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">
          <Clock className="w-3 h-3 inline mr-1" />
          {isWeekday ? clinic.hours.weekdays : isSaturday ? clinic.hours.saturday : clinic.hours.sunday}
        </span>
        {clinic.emergency24h && (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
            24hs
          </span>
        )}
      </div>
    </button>
  );
}

function ClinicDetailPanel({ clinic, onClose }: { clinic: ClinicLocation; onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#0F172A]/95 backdrop-blur-sm z-20 p-4 overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="pt-8">
        <h3 className="text-2xl font-bold text-white mb-2">{clinic.name}</h3>
        <p className="text-white/50 flex items-center gap-1 mb-6">
          <MapPin className="w-4 h-4" />
          {clinic.address}, {clinic.city}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < Math.floor(clinic.rating) ? 'text-[#2DCEA3] fill-[#2DCEA3]' : 'text-white/20'}`}
            />
          ))}
          <span className="text-white font-bold">{clinic.rating}</span>
        </div>

        {/* Hours */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2DCEA3]" />
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
          <h4 className="text-white font-bold mb-2">Especialidades</h4>
          <div className="flex flex-wrap gap-2">
            {clinic.specialties.map((spec, idx) => {
              const Icon = specialtyIcons[spec] || Stethoscope;
              return (
                <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-white/70 text-sm">
                  <Icon className="w-3 h-3" />
                  {spec}
                </span>
              );
            })}
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#2DCEA3]" />
            Contacto
          </h4>
          <a href={`tel:${clinic.phone.replace(/\s/g, '')}`} className="text-[#2DCEA3] hover:underline">
            {clinic.phone}
          </a>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href={`/${clinic.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-xl"
          >
            Visitar Sitio
            <ExternalLink className="w-4 h-4" />
          </Link>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.coordinates.lat},${clinic.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
          >
            <Navigation className="w-4 h-4" />
            Como Llegar
          </a>
        </div>
      </div>
    </div>
  );
}

export function NetworkMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredClinics = useMemo(() => {
    return clinicLocations.filter(clinic => {
      const matchesSearch = searchQuery === '' ||
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = !selectedCity || clinic.city === selectedCity;
      const matchesSpecialty = !selectedSpecialty || clinic.specialties.includes(selectedSpecialty);

      return matchesSearch && matchesCity && matchesSpecialty;
    });
  }, [searchQuery, selectedCity, selectedSpecialty]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity(null);
    setSelectedSpecialty(null);
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedSpecialty;

  return (
    <section id="mapa" className="py-20 md:py-28 bg-gradient-to-b from-[#0F172A] to-[#131B2E] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Encuentra tu Veterinaria
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Red de Clinicas VetePy
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Busca la clinica mas cercana a vos. Todas con el mismo nivel de
            tecnologia y profesionalismo.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad o barrio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#2DCEA3]/50 focus:outline-none transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-[#2DCEA3]/10 border-[#2DCEA3]/30 text-[#2DCEA3]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#2DCEA3]" />
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex flex-wrap gap-4">
                {/* City Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-white/50 text-sm mb-2">Ciudad</label>
                  <select
                    value={selectedCity || ''}
                    onChange={(e) => setSelectedCity(e.target.value || null)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#2DCEA3]/50 focus:outline-none"
                  >
                    <option value="">Todas las ciudades</option>
                    {allCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Specialty Filter */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-white/50 text-sm mb-2">Especialidad</label>
                  <select
                    value={selectedSpecialty || ''}
                    onChange={(e) => setSelectedSpecialty(e.target.value || null)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#2DCEA3]/50 focus:outline-none"
                  >
                    <option value="">Todas las especialidades</option>
                    {allSpecialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="self-end px-4 py-2 text-white/60 hover:text-white transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map and List Container */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Clinic List */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">
                {filteredClinics.length} {filteredClinics.length === 1 ? 'clinica encontrada' : 'clinicas encontradas'}
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {filteredClinics.length > 0 ? (
                filteredClinics.map(clinic => (
                  <ClinicListItem
                    key={clinic.id}
                    clinic={clinic}
                    isSelected={selectedClinic?.id === clinic.id}
                    onClick={() => setSelectedClinic(clinic)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50">No se encontraron clinicas con esos criterios.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[#2DCEA3] hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square lg:aspect-auto lg:h-[500px] rounded-2xl bg-[#1a2744] border border-white/10 overflow-hidden relative">
              {/* Static map background with markers */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Simple visual map representation */}
                <div className="relative w-full h-full">
                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                      backgroundSize: '40px 40px'
                    }}
                  />

                  {/* Clinic markers */}
                  {filteredClinics.map((clinic, idx) => {
                    // Position markers relatively in the container
                    const positions = [
                      { top: '35%', left: '45%' },
                      { top: '55%', left: '60%' }
                    ];
                    const pos = positions[idx] || { top: '50%', left: '50%' };

                    return (
                      <button
                        key={clinic.id}
                        onClick={() => setSelectedClinic(clinic)}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all ${
                          selectedClinic?.id === clinic.id ? 'scale-125' : 'hover:scale-110'
                        }`}
                        style={{ top: pos.top, left: pos.left }}
                      >
                        <div className={`relative ${selectedClinic?.id === clinic.id ? 'animate-pulse' : ''}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                            selectedClinic?.id === clinic.id
                              ? 'bg-[#2DCEA3]'
                              : 'bg-[#5C6BFF]'
                          }`}>
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          {/* Pulse effect */}
                          <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
                            selectedClinic?.id === clinic.id ? 'bg-[#2DCEA3]' : 'bg-[#5C6BFF]'
                          }`} />
                        </div>
                        {/* Label */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                          <span className="px-2 py-1 bg-[#0F172A]/90 rounded text-white text-xs font-medium">
                            {clinic.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Paraguay outline hint */}
                  <div className="absolute inset-4 border-2 border-dashed border-white/5 rounded-3xl" />

                  {/* Asuncion label */}
                  <div className="absolute top-1/4 left-1/3 text-white/20 text-sm font-medium">
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
                  <p className="text-white/40 text-sm">
                    Selecciona una clinica para ver detalles
                  </p>
                </div>
              )}
            </div>

            {/* Open in Google Maps */}
            <div className="mt-4 text-center">
              <a
                href="https://www.google.com/maps/search/veterinaria+vetepy+paraguay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/50 hover:text-[#2DCEA3] transition-colors text-sm"
              >
                <Navigation className="w-4 h-4" />
                Ver en Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Pet Owner CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/50 mb-4">
            ¿Tu veterinaria favorita no esta en la red?
          </p>
          <a
            href="https://wa.me/595981324569?text=Hola!%20Me%20gustaria%20que%20mi%20veterinaria%20use%20VetePy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all"
          >
            Recomendala
          </a>
        </div>
      </div>
    </section>
  );
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  MapPin,
  Star,
  ExternalLink,
  Quote,
  TrendingUp,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Clock,
  Truck,
  ShoppingBag,
} from 'lucide-react'

interface ClinicShowcase {
  id: string
  name: string
  tagline: string
  city: string
  address: string
  testimonial: string
  shortTestimonial: string
  contactPerson: {
    name: string
    role: string
    quote: string
  }
  metrics: {
    appointmentsGrowth: string
    onlineBookingsPercent: string
    patientsRegistered: string
    satisfactionScore: string
  }
  specialties: string[]
  highlights: string[]
  coordinates: { lat: number; lng: number }
}

// Clinic data - in production this would come from the CMS
const clinics: ClinicShowcase[] = [
  {
    id: 'adris',
    name: 'Veterinaria Adris',
    tagline: 'Cuidado Experto, Amor Incondicional',
    city: 'Asuncion',
    address: 'Av. Santa Teresa 1234',
    testimonial:
      'VetePy transformo nuestra forma de trabajar. Ahora tenemos citas online, historial digital y nuestros clientes pueden ver todo desde su celular. En 3 meses aumentamos las citas un 35%.',
    shortTestimonial: 'Aumentamos las citas un 35% en 3 meses.',
    contactPerson: {
      name: 'Dra. Maria Gonzalez',
      role: 'Directora',
      quote: 'Por fin podemos competir con las grandes cadenas veterinarias.',
    },
    metrics: {
      appointmentsGrowth: '+35%',
      onlineBookingsPercent: '65%',
      patientsRegistered: '250+',
      satisfactionScore: '4.9',
    },
    specialties: ['Clinica General', 'Urgencias 24hs', 'Cirugia', 'Vacunacion'],
    highlights: ['Urgencias 24 horas', 'Delivery de productos', 'Tienda online'],
    coordinates: { lat: -25.2637, lng: -57.5759 },
  },
  {
    id: 'petlife',
    name: 'PetLife Center',
    tagline: 'Tecnologia y Salud Animal de Vanguardia',
    city: 'Mariano Roque Alonso',
    address: 'Ruta 2 Km 14',
    testimonial:
      'Como centro de diagnostico especializado, necesitabamos una plataforma profesional. VetePy nos dio exactamente eso, con la posibilidad de recibir derivaciones de otras clinicas de forma ordenada.',
    shortTestimonial: 'Gestion profesional de derivaciones y turnos.',
    contactPerson: {
      name: 'Dr. Carlos Benitez',
      role: 'Director Medico',
      quote: 'La plataforma nos permite enfocarnos en lo que mejor hacemos: diagnosticar.',
    },
    metrics: {
      appointmentsGrowth: '+20%',
      onlineBookingsPercent: '80%',
      patientsRegistered: '180+',
      satisfactionScore: '4.8',
    },
    specialties: ['Diagnostico por Imagenes', 'Ecografia', 'Radiologia', 'Laboratorio'],
    highlights: ['Centro de referencia', 'Equipo de ultima generacion', 'Derivaciones'],
    coordinates: { lat: -25.215, lng: -57.518 },
  },
]

function ClinicCard({ clinic }: { clinic: ClinicShowcase }) {
  return (
    <div className="hover:border-[var(--primary)]/30 group relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-xl font-bold text-white">{clinic.name}</h3>
          <p className="flex items-center gap-1 text-sm text-white/50">
            <MapPin className="h-3 w-3" />
            {clinic.city}
          </p>
        </div>
        <div className="bg-[var(--primary)]/10 flex items-center gap-1 rounded-full px-2 py-1">
          <Star className="h-3 w-3 fill-[var(--primary)] text-[var(--primary)]" />
          <span className="text-sm font-bold text-[var(--primary)]">
            {clinic.metrics.satisfactionScore}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <TrendingUp className="mx-auto mb-1 h-4 w-4 text-[var(--primary)]" />
          <div className="text-sm font-bold text-white">{clinic.metrics.appointmentsGrowth}</div>
          <div className="text-xs text-white/40">Citas</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <Calendar className="mx-auto mb-1 h-4 w-4 text-[var(--secondary)]" />
          <div className="text-sm font-bold text-white">{clinic.metrics.onlineBookingsPercent}</div>
          <div className="text-xs text-white/40">Online</div>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <Users className="mx-auto mb-1 h-4 w-4 text-[var(--accent)]" />
          <div className="text-sm font-bold text-white">{clinic.metrics.patientsRegistered}</div>
          <div className="text-xs text-white/40">Pacientes</div>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-6 flex flex-wrap gap-2">
        {clinic.specialties.slice(0, 3).map((specialty, idx) => (
          <span key={idx} className="rounded-full bg-white/5 px-2 py-1 text-xs text-white/60">
            {specialty}
          </span>
        ))}
        {clinic.specialties.length > 3 && (
          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-white/40">
            +{clinic.specialties.length - 3}
          </span>
        )}
      </div>

      {/* Testimonial */}
      <div className="relative mb-6">
        <Quote className="text-[var(--primary)]/20 absolute -left-1 -top-2 h-6 w-6" />
        <p className="pl-4 text-sm italic leading-relaxed text-white/60">
          "{clinic.shortTestimonial}"
        </p>
        <p className="mt-2 pl-4 text-xs text-white/40">
          — {clinic.contactPerson.name}, {clinic.contactPerson.role}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={`/${clinic.id}`}
        className="group-hover:border-[var(--primary)]/30 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium text-white transition-all hover:border-white/30 hover:bg-white/10"
      >
        Ver Sitio
        <ExternalLink className="h-4 w-4" />
      </Link>
    </div>
  )
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % clinics.length)
  const prev = () => setCurrent((prev) => (prev - 1 + clinics.length) % clinics.length)

  const clinic = clinics[current]

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Large testimonial */}
      <div className="from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-3xl border border-white/10 bg-gradient-to-br p-8 text-center md:p-12">
        <Quote className="text-[var(--primary)]/30 mx-auto mb-6 h-12 w-12" />
        <p className="mb-8 text-xl font-light leading-relaxed text-white/80 md:text-2xl">
          "{clinic.testimonial}"
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-white">{clinic.contactPerson.name}</p>
            <p className="text-sm text-white/50">
              {clinic.contactPerson.role} - {clinic.name}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {clinics.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {clinics.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === current ? 'w-6 bg-[var(--primary)]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ClientShowcase() {
  return (
    <section id="clinicas" className="relative overflow-hidden bg-[var(--bg-dark)] py-20 md:py-28">
      {/* Background decoration */}
      <div className="bg-[var(--primary)]/5 absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full blur-[150px]" />
      <div className="bg-[var(--secondary)]/5 absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full blur-[150px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            Nuestros Clientes
          </span>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            Clinicas que confian en VetePy
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Conoce las veterinarias que ya forman parte de nuestra red. Cada una con su identidad
            unica, todas con tecnologia de primer nivel.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-12 flex flex-wrap justify-center gap-6 md:gap-12">
          <div className="text-center">
            <div className="text-3xl font-black text-[var(--primary)] md:text-4xl">
              {clinics.length}
            </div>
            <div className="text-sm text-white/50">Clinicas Activas</div>
          </div>
          <div className="hidden h-12 w-px bg-white/10 md:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-white md:text-4xl">430+</div>
            <div className="text-sm text-white/50">Mascotas Registradas</div>
          </div>
          <div className="hidden h-12 w-px bg-white/10 md:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-white md:text-4xl">1,200+</div>
            <div className="text-sm text-white/50">Citas Gestionadas</div>
          </div>
          <div className="hidden h-12 w-px bg-white/10 md:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-white md:text-4xl">4.9</div>
            <div className="text-sm text-white/50">Satisfaccion Promedio</div>
          </div>
        </div>

        {/* Clinic Cards Grid */}
        <div className="mx-auto mb-16 grid max-w-4xl gap-6 md:grid-cols-2">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>

        {/* Testimonial Carousel */}
        <div className="mb-12">
          <h3 className="mb-8 text-center text-sm uppercase tracking-widest text-white/40">
            Lo que dicen nuestros clientes
          </h3>
          <TestimonialCarousel />
        </div>

        {/* Join CTA */}
        <div className="text-center">
          <p className="mb-4 text-white/50">¿Queres que tu clinica aparezca aqui?</p>
          <a
            href="https://wa.me/595981324569?text=Hola!%20Quiero%20unir%20mi%20clinica%20a%20VetePy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:shadow-[var(--primary)]/20 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-3 font-bold text-[var(--bg-dark)] transition-all hover:shadow-lg"
          >
            <Building2 className="h-5 w-5" />
            Unir mi Clinica
          </a>
        </div>
      </div>
    </section>
  )
}

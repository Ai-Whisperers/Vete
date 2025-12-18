'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2, MapPin, Star, ExternalLink, Quote,
  TrendingUp, Users, Calendar, ChevronLeft, ChevronRight,
  Stethoscope, Clock, Truck, ShoppingBag
} from 'lucide-react';

interface ClinicShowcase {
  id: string;
  name: string;
  tagline: string;
  city: string;
  address: string;
  testimonial: string;
  shortTestimonial: string;
  contactPerson: {
    name: string;
    role: string;
    quote: string;
  };
  metrics: {
    appointmentsGrowth: string;
    onlineBookingsPercent: string;
    patientsRegistered: string;
    satisfactionScore: string;
  };
  specialties: string[];
  highlights: string[];
  coordinates: { lat: number; lng: number };
}

// Clinic data - in production this would come from the CMS
const clinics: ClinicShowcase[] = [
  {
    id: 'adris',
    name: 'Veterinaria Adris',
    tagline: 'Cuidado Experto, Amor Incondicional',
    city: 'Asuncion',
    address: 'Av. Santa Teresa 1234',
    testimonial: 'VetePy transformo nuestra forma de trabajar. Ahora tenemos citas online, historial digital y nuestros clientes pueden ver todo desde su celular. En 3 meses aumentamos las citas un 35%.',
    shortTestimonial: 'Aumentamos las citas un 35% en 3 meses.',
    contactPerson: {
      name: 'Dra. Maria Gonzalez',
      role: 'Directora',
      quote: 'Por fin podemos competir con las grandes cadenas veterinarias.'
    },
    metrics: {
      appointmentsGrowth: '+35%',
      onlineBookingsPercent: '65%',
      patientsRegistered: '250+',
      satisfactionScore: '4.9'
    },
    specialties: ['Clinica General', 'Urgencias 24hs', 'Cirugia', 'Vacunacion'],
    highlights: ['Urgencias 24 horas', 'Delivery de productos', 'Tienda online'],
    coordinates: { lat: -25.2637, lng: -57.5759 }
  },
  {
    id: 'petlife',
    name: 'PetLife Center',
    tagline: 'Tecnologia y Salud Animal de Vanguardia',
    city: 'Mariano Roque Alonso',
    address: 'Ruta 2 Km 14',
    testimonial: 'Como centro de diagnostico especializado, necesitabamos una plataforma profesional. VetePy nos dio exactamente eso, con la posibilidad de recibir derivaciones de otras clinicas de forma ordenada.',
    shortTestimonial: 'Gestion profesional de derivaciones y turnos.',
    contactPerson: {
      name: 'Dr. Carlos Benitez',
      role: 'Director Medico',
      quote: 'La plataforma nos permite enfocarnos en lo que mejor hacemos: diagnosticar.'
    },
    metrics: {
      appointmentsGrowth: '+20%',
      onlineBookingsPercent: '80%',
      patientsRegistered: '180+',
      satisfactionScore: '4.8'
    },
    specialties: ['Diagnostico por Imagenes', 'Ecografia', 'Radiologia', 'Laboratorio'],
    highlights: ['Centro de referencia', 'Equipo de ultima generacion', 'Derivaciones'],
    coordinates: { lat: -25.2150, lng: -57.5180 }
  }
];

function ClinicCard({ clinic }: { clinic: ClinicShowcase }) {
  return (
    <div className="group relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#2DCEA3]/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{clinic.name}</h3>
          <p className="text-white/50 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {clinic.city}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#2DCEA3]/10">
          <Star className="w-3 h-3 text-[#2DCEA3] fill-[#2DCEA3]" />
          <span className="text-[#2DCEA3] text-sm font-bold">{clinic.metrics.satisfactionScore}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 rounded-lg bg-white/5">
          <TrendingUp className="w-4 h-4 text-[#2DCEA3] mx-auto mb-1" />
          <div className="text-white font-bold text-sm">{clinic.metrics.appointmentsGrowth}</div>
          <div className="text-white/40 text-xs">Citas</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5">
          <Calendar className="w-4 h-4 text-[#5C6BFF] mx-auto mb-1" />
          <div className="text-white font-bold text-sm">{clinic.metrics.onlineBookingsPercent}</div>
          <div className="text-white/40 text-xs">Online</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5">
          <Users className="w-4 h-4 text-[#00C9FF] mx-auto mb-1" />
          <div className="text-white font-bold text-sm">{clinic.metrics.patientsRegistered}</div>
          <div className="text-white/40 text-xs">Pacientes</div>
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 mb-6">
        {clinic.specialties.slice(0, 3).map((specialty, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded-full bg-white/5 text-white/60 text-xs"
          >
            {specialty}
          </span>
        ))}
        {clinic.specialties.length > 3 && (
          <span className="px-2 py-1 rounded-full bg-white/5 text-white/40 text-xs">
            +{clinic.specialties.length - 3}
          </span>
        )}
      </div>

      {/* Testimonial */}
      <div className="relative mb-6">
        <Quote className="absolute -top-2 -left-1 w-6 h-6 text-[#2DCEA3]/20" />
        <p className="text-white/60 text-sm leading-relaxed pl-4 italic">
          "{clinic.shortTestimonial}"
        </p>
        <p className="text-white/40 text-xs mt-2 pl-4">
          — {clinic.contactPerson.name}, {clinic.contactPerson.role}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={`/${clinic.id}`}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/20 text-white font-medium rounded-xl hover:bg-white/10 hover:border-white/30 transition-all group-hover:border-[#2DCEA3]/30"
      >
        Ver Sitio
        <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  );
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % clinics.length);
  const prev = () => setCurrent((prev) => (prev - 1 + clinics.length) % clinics.length);

  const clinic = clinics[current];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Large testimonial */}
      <div className="text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#2DCEA3]/10 to-[#5C6BFF]/10 border border-white/10">
        <Quote className="w-12 h-12 text-[#2DCEA3]/30 mx-auto mb-6" />
        <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-8 font-light">
          "{clinic.testimonial}"
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2DCEA3] to-[#5C6BFF] flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-bold">{clinic.contactPerson.name}</p>
            <p className="text-white/50 text-sm">{clinic.contactPerson.role} - {clinic.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {clinics.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {clinics.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current ? 'bg-[#2DCEA3] w-6' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function ClientShowcase() {
  return (
    <section id="clinicas" className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#2DCEA3]/5 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#5C6BFF]/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Nuestros Clientes
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Clinicas que confian en VetePy
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Conoce las veterinarias que ya forman parte de nuestra red.
            Cada una con su identidad unica, todas con tecnologia de primer nivel.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-[#2DCEA3]">{clinics.length}</div>
            <div className="text-white/50 text-sm">Clinicas Activas</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white">430+</div>
            <div className="text-white/50 text-sm">Mascotas Registradas</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white">1,200+</div>
            <div className="text-white/50 text-sm">Citas Gestionadas</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-white">4.9</div>
            <div className="text-white/50 text-sm">Satisfaccion Promedio</div>
          </div>
        </div>

        {/* Clinic Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>

        {/* Testimonial Carousel */}
        <div className="mb-12">
          <h3 className="text-center text-white/40 uppercase tracking-widest text-sm mb-8">
            Lo que dicen nuestros clientes
          </h3>
          <TestimonialCarousel />
        </div>

        {/* Join CTA */}
        <div className="text-center">
          <p className="text-white/50 mb-4">
            ¿Queres que tu clinica aparezca aqui?
          </p>
          <a
            href="https://wa.me/595981324569?text=Hola!%20Quiero%20unir%20mi%20clinica%20a%20VetePy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full hover:shadow-lg hover:shadow-[#2DCEA3]/20 transition-all"
          >
            <Building2 className="w-5 h-5" />
            Unir mi Clinica
          </a>
        </div>
      </div>
    </section>
  );
}

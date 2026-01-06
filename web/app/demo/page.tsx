'use client'

import {
  Play,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react'
import Link from 'next/link'
import {
  LandingNav,
  LandingFooter,
  FloatingWhatsApp,
  PageHeader,
} from '@/components/landing'

// What to expect items
const expectations = [
  {
    icon: Clock,
    title: '30 minutos',
    description: 'Una demo rápida y personalizada a tu tipo de clínica.',
  },
  {
    icon: CheckCircle,
    title: 'Sin compromiso',
    description: 'Solo queremos mostrarte cómo Vetic puede ayudarte.',
  },
  {
    icon: Calendar,
    title: 'Tu horario',
    description: 'Elegí el día y hora que mejor te convenga.',
  },
]

function VideoPlaceholder() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
      {/* Placeholder background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900 to-slate-900" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110">
          <Play className="h-8 w-8 text-white fill-white ml-1" />
        </button>
      </div>

      {/* Coming soon label */}
      <div className="absolute bottom-4 left-4 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
        <span className="text-sm font-medium text-white">Video próximamente</span>
      </div>
    </div>
  )
}

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <LandingNav />

      <PageHeader
        badge="Demo Gratuita"
        title="Mira Vetic"
        highlight="en acción."
        description="Agenda una demo personalizada de 30 minutos y descubre cómo Vetic puede transformar la gestión de tu clínica."
      />

      {/* Video Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <VideoPlaceholder />

            {/* Live Demo Link */}
            <div className="mt-8 rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
              <h3 className="mb-2 font-bold text-teal-900">
                ¿Querés explorar por tu cuenta?
              </h3>
              <p className="mb-4 text-teal-700">
                Accede a nuestra demo en vivo y navegá todas las funcionalidades.
              </p>
              <Link
                href="/adris"
                className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-bold text-white transition-all hover:bg-teal-700"
              >
                Ir a Demo en Vivo
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Book a Call Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              {/* Left: Info */}
              <div>
                <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">
                  Agenda tu demo personalizada
                </h2>
                <p className="mb-8 text-lg text-slate-600">
                  Te mostramos cómo Vetic se adapta a las necesidades específicas
                  de tu clínica, sin jerga técnica ni presión de venta.
                </p>

                {/* What to expect */}
                <div className="space-y-4">
                  {expectations.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50">
                        <item.icon className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Calendar Placeholder */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                    <Calendar className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    Elegí tu horario
                  </h3>
                  <p className="text-sm text-slate-600">
                    Lunes a Viernes, 9:00 - 18:00
                  </p>
                </div>

                {/* Calendly/Cal.com would go here */}
                <div className="mb-6 rounded-xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                  <p className="mb-4 text-sm text-slate-500">
                    Calendario de reservas próximamente
                  </p>
                  <p className="text-xs text-slate-400">
                    Por ahora, agenda directamente por WhatsApp
                  </p>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href="https://wa.me/595981324569?text=Hola!%20Quiero%20agendar%20una%20demo%20de%20Vetic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-4 font-bold text-white transition-all hover:bg-teal-700"
                >
                  Agendar por WhatsApp
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Link to FAQ */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-sm">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              <span className="text-slate-600">¿Tenés preguntas sobre la demo?</span>
              <Link
                href="/faq"
                className="font-bold text-teal-600 hover:underline"
              >
                Ver FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-600 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
            ¿Listo para ver Vetic?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-teal-100">
            30 minutos que pueden cambiar la forma en que gestionás tu clínica.
          </p>
          <a
            href="https://wa.me/595981324569?text=Hola!%20Quiero%20agendar%20una%20demo%20de%20Vetic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-teal-600 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            Agendar Demo Gratis
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </section>

      <LandingFooter />
      <FloatingWhatsApp />
    </main>
  )
}

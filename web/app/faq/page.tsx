'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import {
  LandingNav,
  LandingFooter,
  FloatingWhatsApp,
  PageHeader,
} from '@/components/landing'
import { getWhatsAppUrl, supportMessages } from '@/lib/whatsapp'

// FAQ categories with their questions
const faqCategories = [
  {
    id: 'general',
    title: 'General',
    faqs: [
      {
        question: '¿Cuánto tiempo tarda en estar listo mi sitio?',
        answer:
          'Generalmente entre 3 a 5 días hábiles una vez que recibimos tu logo y la información de tu clínica. Nosotros nos encargamos de toda la configuración técnica.',
      },
      {
        question: '¿Es difícil de usar el sistema?',
        answer:
          'Para nada. Está diseñado para ser tan fácil como usar Facebook o WhatsApp. Además, te damos una capacitación inicial gratuita para vos y tu equipo.',
      },
      {
        question: '¿Puedo usar mi propio dominio (.com.py)?',
        answer:
          'Sí, absolutamente. Si ya tenés un dominio, lo conectamos gratis. Si no, te ayudamos a registrarlo o te damos una dirección Vetic.com gratuita.',
      },
      {
        question: '¿Mis datos están seguros?',
        answer:
          'Sí, utilizamos encriptación de nivel bancario y backups automáticos diarios. Tus datos y los de tus pacientes son 100% privados y confidenciales.',
      },
      {
        question: '¿Ofrecen soporte técnico?',
        answer:
          'Sí, soporte local vía WhatsApp. No hablamos con robots ni tickets eternos; hablás con personas reales que conocen tu negocio.',
      },
    ],
  },
  {
    id: 'precios',
    title: 'Precios y Pagos',
    faqs: [
      {
        question: '¿Puedo cambiar de plan después?',
        answer:
          'Sí, puedes subir o bajar de plan en cualquier momento. Los cambios se aplican al siguiente período de facturación. Si subes de plan, pagarás la diferencia prorrateada.',
      },
      {
        question: '¿Hay costo de instalación o setup?',
        answer:
          'No, no hay costos ocultos. El precio mensual incluye todo: configuración inicial, migración de datos, capacitación y soporte continuo.',
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer:
          'Aceptamos Bancard (débito y crédito), Zimple, transferencia bancaria y depósito. Para planes anuales ofrecemos descuento del 15%.',
      },
      {
        question: '¿Puedo cancelar cuando quiera?',
        answer:
          'Sí, no hay contratos de permanencia. Puedes cancelar en cualquier momento y seguirás teniendo acceso hasta el final del período pagado.',
      },
    ],
  },
  {
    id: 'demo',
    title: 'Demo y Prueba',
    faqs: [
      {
        question: '¿Qué voy a ver en la demo?',
        answer:
          'Te mostraremos las funcionalidades principales: agenda, historial clínico, tienda online y facturación. Personalizamos la demo según el tipo de clínica que tengas.',
      },
      {
        question: '¿Necesito preparar algo para la demo?',
        answer:
          'No necesitás preparar nada. Solo tené a mano una idea de cuántos pacientes atendés por mes y cuántas personas trabajan en tu clínica para personalizar mejor la demo.',
      },
      {
        question: '¿Puedo invitar a mi equipo a la demo?',
        answer:
          '¡Claro! Mientras más personas de tu equipo participen, mejor podrán evaluar si Vetic es la solución correcta.',
      },
      {
        question: '¿La demo es por videollamada?',
        answer:
          'Sí, usamos Google Meet o WhatsApp videollamada, lo que te sea más cómodo. Te enviamos el link después de agendar.',
      },
    ],
  },
]

function FAQAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-white)]"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-medium text-[var(--landing-text-primary)]">{faq.question}</span>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 flex-shrink-0 text-[var(--landing-text-light)]" />
            ) : (
              <ChevronDown className="h-5 w-5 flex-shrink-0 text-[var(--landing-text-light)]" />
            )}
          </button>
          {openIndex === index && (
            <div className="border-t border-[var(--landing-border-light)] px-6 py-4">
              <p className="text-[var(--landing-text-secondary)]">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function FAQPage(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState('general')

  return (
    <main className="min-h-screen bg-[var(--landing-bg)]">
      <LandingNav />

      <PageHeader
        badge="Centro de Ayuda"
        title="Preguntas"
        highlight="Frecuentes"
        description="Todo lo que necesitas saber sobre Vetic. Si no encontrás tu respuesta, escribinos por WhatsApp."
      />

      {/* Category Tabs */}
      <section className="border-b border-[var(--landing-border-light)] bg-[var(--landing-bg-white)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-2 overflow-x-auto py-4 md:justify-center">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-[var(--landing-primary)] text-white'
                    : 'bg-[var(--landing-bg-muted)] text-[var(--landing-text-secondary)] hover:bg-[var(--landing-primary-lighter)] hover:text-[var(--landing-primary)]'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl">
            {faqCategories.map((category) =>
              category.id === activeCategory ? (
                <div key={category.id}>
                  <h2 className="mb-8 text-2xl font-bold text-[var(--landing-text-primary)]">
                    {category.title}
                  </h2>
                  <FAQAccordion faqs={category.faqs} />
                </div>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="bg-[var(--landing-bg-white)] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--landing-primary-lighter)]">
              <HelpCircle className="h-8 w-8 text-[var(--landing-primary)]" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-[var(--landing-text-primary)]">
              ¿No encontraste tu respuesta?
            </h2>
            <p className="mb-8 text-[var(--landing-text-secondary)]">
              Nuestro equipo está disponible para ayudarte con cualquier consulta.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href={getWhatsAppUrl(supportMessages.question())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--landing-primary)] px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--landing-primary-hover)]"
              >
                <MessageCircle className="h-5 w-5" />
                Escribir por WhatsApp
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-full border-2 border-[var(--landing-border)] px-8 py-4 font-bold text-[var(--landing-text-primary)] transition-all hover:border-[var(--landing-primary)] hover:text-[var(--landing-primary)]"
              >
                Agendar una Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <FloatingWhatsApp />
    </main>
  )
}

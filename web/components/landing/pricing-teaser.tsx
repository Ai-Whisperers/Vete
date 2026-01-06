import Link from 'next/link'
import { ArrowRight, Check, Star } from 'lucide-react'

/**
 * Lightweight pricing teaser for the homepage
 * Shows 3 key plans with basic info, redirects to /precios for full details
 */

// Simplified plan data - just enough for the teaser
const teaserPlans = [
  {
    id: 'gratis',
    name: 'Gratis',
    price: '0',
    description: 'Para empezar',
    highlight: 'Sin costo',
    features: ['Sitio web propio', 'Agenda de citas', 'Historial clínico'],
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    price: '200.000',
    description: 'Más popular',
    highlight: 'Tienda online',
    popular: true,
    features: ['Todo de Gratis +', 'E-commerce', 'Tags QR para mascotas'],
  },
  {
    id: 'profesional',
    name: 'Profesional',
    price: '400.000',
    description: 'Completo',
    highlight: 'Hospital + Lab',
    features: ['Todo de Crecimiento +', 'Hospitalización', 'WhatsApp API'],
  },
]

export function PricingTeaser(): React.ReactElement {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-[var(--landing-primary-lighter)] px-4 py-1.5 text-sm font-medium text-[var(--landing-primary)]">
            Planes
          </span>
          <h2 className="mb-4 text-3xl font-bold text-[var(--landing-text-primary)] md:text-4xl">
            Planes que crecen con tu clínica
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[var(--landing-text-secondary)]">
            Sin costos ocultos, sin contratos. Empezá gratis y subí cuando lo necesites.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {teaserPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${
                plan.popular
                  ? 'border-[var(--landing-primary)] bg-[var(--landing-primary-lighter)] shadow-md'
                  : 'border-[var(--landing-border)] bg-[var(--landing-bg-white)]'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[var(--landing-primary)] px-3 py-1 text-xs font-bold text-white">
                  <Star className="h-3 w-3 fill-current" />
                  Popular
                </div>
              )}

              {/* Plan name */}
              <h3 className="mb-1 text-lg font-bold text-[var(--landing-text-primary)]">
                {plan.name}
              </h3>
              <p className="mb-4 text-sm text-[var(--landing-text-muted)]">{plan.description}</p>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-[var(--landing-text-primary)]">
                  {plan.price === '0' ? 'Gratis' : `Gs ${plan.price}`}
                </span>
                {plan.price !== '0' && (
                  <span className="text-sm text-[var(--landing-text-muted)]">/mes</span>
                )}
              </div>

              {/* Feature highlight */}
              <div className="mb-4 rounded-lg bg-[var(--landing-bg-muted)] px-3 py-2 text-center text-sm font-medium text-[var(--landing-text-secondary)]">
                {plan.highlight}
              </div>

              {/* Quick features */}
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-[var(--landing-text-secondary)]">
                    <Check className="h-4 w-4 flex-shrink-0 text-[var(--landing-primary)]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA to full pricing */}
        <div className="mt-10 text-center">
          <Link
            href="/precios"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--landing-primary)] px-8 py-4 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--landing-primary-hover)]"
          >
            Ver todos los planes y comparar
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-[var(--landing-text-muted)]">
            Prueba gratis por 3 meses con todas las funciones
          </p>
        </div>
      </div>
    </section>
  )
}

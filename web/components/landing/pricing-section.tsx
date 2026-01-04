'use client'

import { useState } from 'react'
import {
  Check,
  X,
  MessageCircle,
  Sparkles,
  HelpCircle,
  Sprout,
  TreeDeciduous,
  Trees,
  Crown,
  ArrowRight,
  Gift,
  Clock,
  Heart,
  Percent,
  Building2,
} from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  icon: React.ReactNode
  subtitle: string
  description: string
  targetClinic: string
  petsPerMonth: string
  setupPrice: number
  setupDisplay: string
  monthlyPrice: number
  commitment: string
  features: { text: string; included: boolean; highlight?: boolean }[]
  cta: string
  ctaMessage: string
  popular?: boolean
  color: string
}

const tiers: PricingTier[] = [
  {
    id: 'semilla',
    name: 'Semilla',
    icon: <Sprout className="h-6 w-6" />,
    subtitle: 'Precio de apoyo',
    description:
      'Precio especial para ayudar a clinicas nuevas a arrancar. Acceso completo a todas las funcionalidades mientras creces.',
    targetClinic: 'Clinica nueva, 1-2 veterinarios',
    petsPerMonth: 'Menos de 50 pacientes/mes',
    setupPrice: 0,
    setupDisplay: 'Gs 0*',
    monthlyPrice: 150000,
    commitment: '12 meses minimo',
    features: [
      { text: 'Sitio web profesional completo', included: true },
      { text: 'Sistema de citas online', included: true },
      { text: 'Portal de mascotas para clientes', included: true },
      { text: 'Historial medico digital', included: true },
      { text: 'Carnet de vacunas', included: true },
      { text: 'Herramientas clinicas basicas', included: true },
      { text: 'Soporte por email', included: true },
      { text: 'Hosting y SSL incluidos', included: true },
      { text: 'Soporte WhatsApp prioritario', included: false },
      { text: 'Modulos de laboratorio', included: false },
      { text: 'E-commerce / Tienda', included: false },
    ],
    cta: 'Empezar con Semilla',
    ctaMessage: 'Hola! Soy una clinica pequeña y me interesa el Plan Semilla de VetePy',
    color: '#4ADE80',
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    icon: <TreeDeciduous className="h-6 w-6" />,
    subtitle: 'El mas popular',
    description: 'Para clinicas en expansion que quieren profesionalizarse y crecer.',
    targetClinic: 'Clinica en crecimiento, 2-4 veterinarios',
    petsPerMonth: '50-150 pacientes/mes',
    setupPrice: 500000,
    setupDisplay: 'Gs 500.000',
    monthlyPrice: 200000,
    commitment: '6 meses minimo',
    popular: true,
    features: [
      { text: 'Todo lo del Plan Semilla', included: true, highlight: true },
      { text: 'Soporte WhatsApp (horario laboral)', included: true },
      { text: 'Herramientas clinicas completas', included: true },
      { text: 'Recordatorios automaticos', included: true },
      { text: 'Tags QR para mascotas', included: true },
      { text: 'Reportes basicos', included: true },
      { text: 'E-commerce disponible (+extra)', included: true },
      { text: 'Modulos lab/hospital (+extra)', included: true },
      { text: 'Account manager dedicado', included: false },
      { text: 'WhatsApp Business API', included: false },
      { text: 'Integraciones custom', included: false },
    ],
    cta: 'Elegir Crecimiento',
    ctaMessage: 'Hola! Me interesa el Plan Crecimiento de VetePy para mi clinica',
    color: '#2DCEA3',
  },
  {
    id: 'establecida',
    name: 'Establecida',
    icon: <Trees className="h-6 w-6" />,
    subtitle: 'Para lideres',
    description: 'Para clinicas consolidadas que buscan la mejor tecnologia y soporte.',
    targetClinic: 'Clinica establecida, 4+ veterinarios',
    petsPerMonth: '150-400 pacientes/mes',
    setupPrice: 700000,
    setupDisplay: 'Gs 700.000',
    monthlyPrice: 300000,
    commitment: 'Sin compromiso',
    features: [
      { text: 'Todo lo del Plan Crecimiento', included: true, highlight: true },
      { text: 'Soporte WhatsApp prioritario 24/7', included: true },
      { text: 'WhatsApp Business API incluido', included: true },
      { text: 'Modulos lab y hospitalizacion', included: true },
      { text: 'Account manager dedicado', included: true },
      { text: 'Reportes avanzados', included: true },
      { text: 'Capacitacion para staff', included: true },
      { text: 'Integraciones disponibles', included: true },
      { text: 'Multi-sucursal', included: false },
      { text: 'API personalizada', included: false },
      { text: 'Desarrollo a medida', included: false },
    ],
    cta: 'Elegir Establecida',
    ctaMessage: 'Hola! Tengo una clinica establecida y me interesa el Plan Establecida de VetePy',
    color: '#5C6BFF',
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: <Crown className="h-6 w-6" />,
    subtitle: 'Empresarial',
    description: 'Solucion completa para grandes clinicas o cadenas con multiples sucursales.',
    targetClinic: 'Cadena o clinica de alto volumen',
    petsPerMonth: '400+ pacientes/mes',
    setupPrice: -1,
    setupDisplay: 'A medida',
    monthlyPrice: 500000,
    commitment: 'Contrato personalizado',
    features: [
      { text: 'Todo lo del Plan Establecida', included: true, highlight: true },
      { text: 'Soporte multi-sucursal', included: true },
      { text: 'API personalizada', included: true },
      { text: 'Desarrollo a medida', included: true },
      { text: 'Integraciones con tu software', included: true },
      { text: 'Reportes corporativos', included: true },
      { text: 'SLA garantizado', included: true },
      { text: 'Revisiones trimestrales', included: true },
      { text: 'Capacitacion continua', included: true },
      { text: 'Linea de soporte dedicada', included: true },
      { text: 'Servidor dedicado opcional', included: true },
    ],
    cta: 'Contactar Ventas',
    ctaMessage: 'Hola! Tengo una clinica grande o cadena y me interesa el Plan Premium de VetePy',
    color: '#F59E0B',
  },
]

const loyaltyDiscounts = [
  { months: 6, discount: 5, label: '6 meses prepago' },
  { months: 12, discount: 10, label: '12 meses prepago' },
  { months: 24, discount: 15, label: '24 meses prepago' },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY').format(price)
}

function TierCard({
  tier,
  isSelected,
  onSelect,
}: {
  tier: PricingTier
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
        isSelected
          ? 'scale-[1.02] border-2 bg-white/10'
          : 'border border-white/10 bg-white/5 hover:bg-white/[0.07]'
      }`}
      style={{ borderColor: isSelected ? tier.color : undefined }}
    >
      {tier.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-[#0F172A]"
          style={{ backgroundColor: tier.color }}
        >
          Mas Popular
        </div>
      )}

      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          {tier.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{tier.name}</h3>
          <p className="text-xs text-white/50">{tier.subtitle}</p>
        </div>
      </div>

      <p className="mb-4 text-sm text-white/60">{tier.petsPerMonth}</p>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white">Gs {formatPrice(tier.monthlyPrice)}</span>
        <span className="text-sm text-white/50">/mes</span>
      </div>
    </div>
  )
}

export function PricingSection() {
  const [selectedTier, setSelectedTier] = useState<string>('crecimiento')
  const [showLoyalty, setShowLoyalty] = useState(false)

  const currentTier = tiers.find((t) => t.id === selectedTier) || tiers[1]

  return (
    <section
      id="precios"
      className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#131B2E] to-[#0F172A] py-20 md:py-28"
    >
      {/* Gradient orbs */}
      <div className="absolute left-0 top-1/4 h-[300px] w-[300px] rounded-full bg-[#2DCEA3]/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 h-[300px] w-[300px] rounded-full bg-[#5C6BFF]/10 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-[#2DCEA3]">
            Planes y Precios
          </span>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            Crece con nosotros
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            <span className="text-[#2DCEA3]">Apoyamos a clinicas nuevas</span> con precios
            accesibles para que arranquen. A medida que creces, tu plan crece con vos.
          </p>
        </div>

        {/* Trial Banner */}
        <div className="mx-auto mb-10 max-w-4xl">
          <div className="relative rounded-2xl border border-[#2DCEA3]/30 bg-gradient-to-r from-[#2DCEA3]/20 to-[#5C6BFF]/20 p-6">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2DCEA3]/20">
                <Gift className="h-7 w-7 text-[#2DCEA3]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-1 text-xl font-bold text-white">
                  Prueba Sin Riesgo - 3 Meses Gratis
                </h3>
                <p className="text-sm text-white/60">
                  Probalo antes de comprometerte. Si decides continuar, el setup se divide en 12
                  cuotas. Si no, te vas sin pagar nada.
                </p>
              </div>
              <a
                href="#prueba-gratis"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#2DCEA3] px-6 py-3 font-bold text-[#0F172A] transition-all hover:bg-[#2DCEA3]/90"
              >
                Ver Detalles
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Tier Selector */}
        <div className="mx-auto mb-8 grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4">
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              isSelected={selectedTier === tier.id}
              onSelect={() => setSelectedTier(tier.id)}
            />
          ))}
        </div>

        {/* Selected Tier Details */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pricing Details */}
            <div
              className="rounded-3xl border-2 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-sm"
              style={{ borderColor: `${currentTier.color}50` }}
            >
              {/* Tier Header */}
              <div className="mb-6 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}
                >
                  {currentTier.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Plan {currentTier.name}</h3>
                  <p className="text-white/60">{currentTier.targetClinic}</p>
                </div>
              </div>

              {/* Description */}
              <p className="mb-6 text-white/70">{currentTier.description}</p>

              {/* Pricing */}
              <div className="mb-6 space-y-4">
                {/* Setup */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <div>
                    <span className="text-sm text-white/50">Configuracion inicial</span>
                    {currentTier.id === 'semilla' && (
                      <p className="text-xs text-[#4ADE80]">*Diferido en 12 cuotas</p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-white">{currentTier.setupDisplay}</span>
                </div>

                {/* Monthly */}
                <div
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ backgroundColor: `${currentTier.color}15` }}
                >
                  <span className="text-white/70">Mensualidad</span>
                  <div className="text-right">
                    <span className="text-3xl font-black" style={{ color: currentTier.color }}>
                      Gs {formatPrice(currentTier.monthlyPrice)}
                    </span>
                    <span className="text-sm text-white/50">/mes</span>
                  </div>
                </div>

                {/* Commitment */}
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Clock className="h-4 w-4" />
                  <span>Compromiso: {currentTier.commitment}</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/595981324569?text=${encodeURIComponent(currentTier.ctaMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-bold text-[#0F172A] shadow-lg transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}CC)`,
                  boxShadow: `0 10px 40px ${currentTier.color}30`,
                }}
              >
                <MessageCircle className="h-5 w-5" />
                {currentTier.cta}
              </a>
            </div>

            {/* Features List */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h4 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Sparkles className="h-5 w-5" style={{ color: currentTier.color }} />
                Que incluye {currentTier.name}
              </h4>

              <div className="space-y-3">
                {currentTier.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-lg p-2 ${
                      feature.highlight ? 'bg-white/5' : ''
                    }`}
                  >
                    {feature.included ? (
                      <Check
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: currentTier.color }}
                      />
                    ) : (
                      <X className="h-5 w-5 flex-shrink-0 text-white/30" />
                    )}
                    <span className={feature.included ? 'text-white/80' : 'text-white/40'}>
                      {feature.text}
                    </span>
                    {feature.highlight && (
                      <span
                        className="ml-auto rounded-full px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${currentTier.color}20`,
                          color: currentTier.color,
                        }}
                      >
                        Base
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Upgrade hint for lower tiers */}
              {currentTier.id === 'semilla' && (
                <div className="mt-6 rounded-xl border border-[#4ADE80]/20 bg-[#4ADE80]/10 p-4">
                  <p className="text-sm text-white/70">
                    <span className="font-bold text-[#4ADE80]">Precio de apoyo:</span> Este plan
                    existe para ayudar a clinicas nuevas a crecer. Cuando tu clinica se establezca,
                    transicionas al Plan Crecimiento o Establecida con precios estandar.
                  </p>
                </div>
              )}
              {currentTier.id === 'crecimiento' && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">
                    <span className="font-medium text-white">¿Tu clinica crece?</span> Podes subir
                    al Plan Establecida en cualquier momento para acceder a funcionalidades
                    avanzadas y soporte prioritario.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Loyalty Discounts */}
          <div className="mt-8">
            <button
              onClick={() => setShowLoyalty(!showLoyalty)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#F472B6]" />
                <span className="font-medium text-white">Descuentos por lealtad</span>
              </div>
              <Percent
                className={`h-5 w-5 text-white/50 transition-transform ${showLoyalty ? 'rotate-180' : ''}`}
              />
            </button>

            {showLoyalty && (
              <div className="animate-in fade-in slide-in-from-top-2 mt-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <p className="mb-4 text-sm text-white/60">
                  Pagando por adelantado, obtenes descuentos sobre la mensualidad:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {loyaltyDiscounts.map((discount) => (
                    <div key={discount.months} className="rounded-xl bg-white/5 p-4 text-center">
                      <div className="text-2xl font-black text-[#2DCEA3]">
                        -{discount.discount}%
                      </div>
                      <div className="text-sm text-white/50">{discount.label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-white/40">
                  Despues de 24 meses activo, obtenes 10% de descuento permanente.
                </p>
              </div>
            )}
          </div>

          {/* ROI Hint */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="mb-2 text-white/70">
              <span className="font-bold text-white">¿Vale la pena?</span> Con el Plan{' '}
              {currentTier.name}, necesitas solo{' '}
              <span className="font-bold text-[#2DCEA3]">
                {Math.ceil(currentTier.monthlyPrice / 150000)}{' '}
                {Math.ceil(currentTier.monthlyPrice / 150000) === 1
                  ? 'cliente nuevo'
                  : 'clientes nuevos'}{' '}
                al mes
              </span>{' '}
              para cubrir la inversion. El resto es ganancia.
            </p>
            <a href="#calculadora" className="text-sm text-[#2DCEA3] hover:underline">
              Calcula tu ROI personalizado →
            </a>
          </div>

          {/* Payment flexibility */}
          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-white/50">
              Necesitas facilidades de pago? Escribinos y lo coordinamos.
            </p>
            <p className="text-sm text-white/40">
              Sin contratos abusivos. Cancelas cuando quieras (respetando el minimo del plan).
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import {
  Check,
  X,
  MessageCircle,
  Sparkles,
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
  ShieldCheck,
  Users,
  Megaphone,
  Store,
  Beaker,
  BarChart3,
  Zap,
} from 'lucide-react'
import {
  pricingTiers,
  discounts,
  trialConfig,
  roiGuarantee,
  calculateRoiThreshold,
  type TierId,
} from '@/lib/pricing/tiers'
import { brandConfig } from '@/lib/branding/config'

interface DisplayTier {
  id: TierId
  name: string
  icon: React.ReactNode
  subtitle: string
  description: string
  targetClinic: string
  monthlyPrice: number
  includedUsers: number
  extraUserPrice: number
  features: { text: string; included: boolean; highlight?: boolean }[]
  cta: string
  ctaMessage: string
  popular?: boolean
  enterprise?: boolean
  color: string
  showAds?: boolean
  commissionRate?: number
}

// Map pricing config to display format
const displayTiers: DisplayTier[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    icon: <Megaphone className="h-6 w-6" />,
    subtitle: 'Para empezar',
    description:
      'Acceso completo a todas las funcionalidades con publicidad. Ideal para probar la plataforma sin compromiso.',
    targetClinic: 'Cualquier clinica',
    monthlyPrice: 0,
    includedUsers: Infinity,
    extraUserPrice: 0,
    showAds: true,
    features: [
      { text: 'Sitio web profesional completo', included: true },
      { text: 'Sistema de citas online', included: true },
      { text: 'Portal de mascotas', included: true },
      { text: 'Historial medico digital', included: true },
      { text: 'Carnet de vacunas', included: true },
      { text: 'Herramientas clinicas', included: true },
      { text: 'Usuarios ilimitados', included: true },
      { text: 'Muestra publicidad', included: true, highlight: true },
      { text: 'Soporte comunidad/foro', included: true },
      { text: 'E-commerce / Tienda', included: false },
      { text: 'Tags QR', included: false },
      { text: 'Analytics', included: false },
    ],
    cta: 'Empezar Gratis',
    ctaMessage: `Hola! Me interesa probar ${brandConfig.name} gratis para mi clinica`,
    color: '#9CA3AF',
  },
  {
    id: 'basico',
    name: 'Basico',
    icon: <Sprout className="h-6 w-6" />,
    subtitle: 'Sin anuncios',
    description: 'Todo lo del plan Gratis pero sin publicidad. Experiencia limpia para tu clinica.',
    targetClinic: 'Clinica pequeña, 1-2 vets',
    monthlyPrice: 100000,
    includedUsers: 3,
    extraUserPrice: 30000,
    features: [
      { text: 'Todo lo del Plan Gratis', included: true, highlight: true },
      { text: 'Sin publicidad', included: true },
      { text: 'Soporte por email (48h)', included: true },
      { text: '3 usuarios incluidos', included: true },
      { text: '+Gs 30.000/usuario extra', included: true },
      { text: 'E-commerce / Tienda', included: false },
      { text: 'Tags QR', included: false },
      { text: 'Pedidos mayoristas', included: false },
      { text: 'WhatsApp Business API', included: false },
    ],
    cta: 'Elegir Basico',
    ctaMessage: `Hola! Me interesa el Plan Basico de ${brandConfig.name}`,
    color: '#4ADE80',
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    icon: <TreeDeciduous className="h-6 w-6" />,
    subtitle: 'El mas popular',
    description:
      'Para clinicas que quieren vender productos online y acceder a compras mayoristas.',
    targetClinic: 'Clinica en crecimiento, 2-4 vets',
    monthlyPrice: 200000,
    includedUsers: 5,
    extraUserPrice: 40000,
    popular: true,
    commissionRate: 0.03,
    features: [
      { text: 'Todo lo del Plan Basico', included: true, highlight: true },
      { text: 'E-commerce / Tienda online', included: true },
      { text: 'Comision: 3% sobre ventas', included: true },
      { text: 'Tags QR para mascotas', included: true },
      { text: 'Acceso a pedidos mayoristas', included: true },
      { text: 'Analytics basico', included: true },
      { text: 'Soporte email (24h)', included: true },
      { text: '5 usuarios incluidos', included: true },
      { text: '+Gs 40.000/usuario extra', included: true },
      { text: 'WhatsApp Business API', included: false },
      { text: 'Hospitalizacion', included: false },
      { text: 'Laboratorio', included: false },
    ],
    cta: 'Elegir Crecimiento',
    ctaMessage: `Hola! Me interesa el Plan Crecimiento de ${brandConfig.name}`,
    color: '#2DCEA3',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    icon: <Trees className="h-6 w-6" />,
    subtitle: 'Completo',
    description:
      'Todas las funcionalidades premium incluyendo hospitalizacion, laboratorio y WhatsApp Business.',
    targetClinic: 'Clinica establecida, 4+ vets',
    monthlyPrice: 400000,
    includedUsers: 10,
    extraUserPrice: 50000,
    commissionRate: 0.03,
    features: [
      { text: 'Todo lo del Plan Crecimiento', included: true, highlight: true },
      { text: 'WhatsApp Business API', included: true },
      { text: 'Modulo de hospitalizacion', included: true },
      { text: 'Modulo de laboratorio', included: true },
      { text: 'Analytics avanzado', included: true },
      { text: 'Soporte WhatsApp (12h)', included: true },
      { text: '10 usuarios incluidos', included: true },
      { text: '+Gs 50.000/usuario extra', included: true },
      { text: 'Multi-sucursal', included: false },
      { text: 'API personalizada', included: false },
      { text: 'SLA garantizado', included: false },
    ],
    cta: 'Elegir Profesional',
    ctaMessage: `Hola! Me interesa el Plan Profesional de ${brandConfig.name}`,
    color: '#5C6BFF',
  },
  {
    id: 'empresarial',
    name: 'Empresarial',
    icon: <Crown className="h-6 w-6" />,
    subtitle: 'A medida',
    description:
      'Solucion personalizada para cadenas o clinicas de alto volumen con multiples sucursales.',
    targetClinic: 'Cadenas, multi-sucursal',
    monthlyPrice: 0,
    includedUsers: 20,
    extraUserPrice: 60000,
    enterprise: true,
    commissionRate: 0.02,
    features: [
      { text: 'Todo lo del Plan Profesional', included: true, highlight: true },
      { text: 'Multi-sucursal ilimitado', included: true },
      { text: 'API personalizada', included: true },
      { text: 'Integraciones a medida', included: true },
      { text: 'Analytics con IA', included: true },
      { text: 'Soporte prioritario (4h SLA)', included: true },
      { text: 'Account manager dedicado', included: true },
      { text: '20+ usuarios incluidos', included: true },
      { text: 'Comision negociada (desde 2%)', included: true },
      { text: 'Servidor dedicado opcional', included: true },
      { text: 'Capacitacion continua', included: true },
    ],
    cta: 'Contactar Ventas',
    ctaMessage: `Hola! Tengo una cadena de clinicas y me interesa el Plan Empresarial de ${brandConfig.name}`,
    color: '#F59E0B',
  },
]

const loyaltyDiscounts = [
  { months: 6, discount: 10, label: '6 meses' },
  { months: 12, discount: 20, label: '12 meses' },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY').format(price)
}

function TierCard({
  tier,
  isSelected,
  onSelect,
}: {
  tier: DisplayTier
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 ${
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

      <div className="mb-2 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          {tier.icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{tier.name}</h3>
          <p className="text-xs text-white/50">{tier.subtitle}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        {tier.enterprise ? (
          <span className="text-lg font-black text-white">Personalizado</span>
        ) : tier.monthlyPrice === 0 ? (
          <span className="text-lg font-black" style={{ color: tier.color }}>
            Gratis
          </span>
        ) : (
          <>
            <span className="text-lg font-black text-white">
              Gs {formatPrice(tier.monthlyPrice)}
            </span>
            <span className="text-xs text-white/50">/mes</span>
          </>
        )}
      </div>

      {tier.showAds && <p className="mt-1 text-xs text-amber-400/80">Con publicidad</p>}
    </div>
  )
}

export function PricingSection() {
  const [selectedTier, setSelectedTier] = useState<TierId>('crecimiento')
  const [showLoyalty, setShowLoyalty] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  const currentTier = displayTiers.find((t) => t.id === selectedTier) || displayTiers[2]

  const getDisplayPrice = () => {
    if (currentTier.enterprise || currentTier.monthlyPrice === 0) return null
    const basePrice = currentTier.monthlyPrice
    if (billingPeriod === 'annual') {
      return Math.round(basePrice * (1 - discounts.annual))
    }
    return basePrice
  }

  const displayPrice = getDisplayPrice()
  const roiThreshold = currentTier.monthlyPrice > 0 ? calculateRoiThreshold(currentTier.monthlyPrice) : 0

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
            Empieza gratis, crece con nosotros
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            <span className="text-[#2DCEA3]">Plan Gratis con todas las funcionalidades</span>.
            Actualiza cuando quieras para quitar anuncios y acceder a e-commerce.
          </p>
        </div>

        {/* ROI Guarantee Banner */}
        <div className="mx-auto mb-8 max-w-4xl">
          <div className="relative rounded-2xl border border-[#2DCEA3]/30 bg-gradient-to-r from-[#2DCEA3]/20 to-[#5C6BFF]/20 p-6">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2DCEA3]/20">
                <ShieldCheck className="h-7 w-7 text-[#2DCEA3]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-1 text-xl font-bold text-white">Garantia de ROI</h3>
                <p className="text-sm text-white/60">
                  Si no conseguis suficientes clientes nuevos en 6 meses para cubrir tu suscripcion,{' '}
                  <span className="font-bold text-[#2DCEA3]">los proximos 6 meses son GRATIS</span>.
                </p>
              </div>
              <a
                href="#calculadora"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#2DCEA3] px-6 py-3 font-bold text-[#0F172A] transition-all hover:bg-[#2DCEA3]/90"
              >
                Calcular ROI
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Trial + Referral Banner */}
        <div className="mx-auto mb-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-amber-400" />
              <div>
                <h4 className="font-bold text-white">{trialConfig.standardDays / 30} Meses de Prueba</h4>
                <p className="text-sm text-white/60">
                  Plan Profesional gratis por {trialConfig.standardDays / 30} meses
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-pink-400" />
              <div>
                <h4 className="font-bold text-white">Programa de Referidos</h4>
                <p className="text-sm text-white/60">
                  {discounts.referral * 100}% descuento por cada referido (acumulable)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="mx-auto mb-8 flex max-w-xs items-center justify-center gap-3 rounded-full bg-white/5 p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              billingPeriod === 'monthly' ? 'bg-[#2DCEA3] text-[#0F172A]' : 'text-white/60'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              billingPeriod === 'annual' ? 'bg-[#2DCEA3] text-[#0F172A]' : 'text-white/60'
            }`}
          >
            Anual -{discounts.annual * 100}%
          </button>
        </div>

        {/* Tier Selector */}
        <div className="mx-auto mb-8 grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {displayTiers.map((tier) => (
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
                {/* Monthly */}
                <div
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ backgroundColor: `${currentTier.color}15` }}
                >
                  <span className="text-white/70">
                    {billingPeriod === 'annual' ? 'Por mes (pago anual)' : 'Mensualidad'}
                  </span>
                  <div className="text-right">
                    {currentTier.enterprise ? (
                      <span className="text-2xl font-black" style={{ color: currentTier.color }}>
                        Personalizado
                      </span>
                    ) : currentTier.monthlyPrice === 0 ? (
                      <span className="text-2xl font-black" style={{ color: currentTier.color }}>
                        Gratis
                      </span>
                    ) : (
                      <>
                        {billingPeriod === 'annual' && (
                          <span className="mr-2 text-sm text-white/40 line-through">
                            Gs {formatPrice(currentTier.monthlyPrice)}
                          </span>
                        )}
                        <span className="text-2xl font-black" style={{ color: currentTier.color }}>
                          Gs {formatPrice(displayPrice!)}
                        </span>
                        <span className="text-sm text-white/50">/mes</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Users included */}
                {currentTier.includedUsers !== Infinity && (
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Users className="h-4 w-4" />
                    <span>
                      {currentTier.includedUsers} usuarios incluidos · +Gs{' '}
                      {formatPrice(currentTier.extraUserPrice)} por usuario extra
                    </span>
                  </div>
                )}

                {/* Commission */}
                {currentTier.commissionRate && (
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Store className="h-4 w-4" />
                    <span>
                      Comision e-commerce: {currentTier.commissionRate * 100}% sobre ventas
                    </span>
                  </div>
                )}

                {/* Ads warning */}
                {currentTier.showAds && (
                  <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-400">
                    <Megaphone className="mb-1 inline h-4 w-4" /> Este plan muestra publicidad en tu
                    sitio web y portal
                  </div>
                )}
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

              {/* ROI for paid tiers */}
              {currentTier.monthlyPrice > 0 && !currentTier.enterprise && (
                <div className="mt-4 rounded-xl border border-[#2DCEA3]/20 bg-[#2DCEA3]/10 p-4">
                  <p className="text-center text-sm text-white/70">
                    <ShieldCheck className="mr-1 inline h-4 w-4 text-[#2DCEA3]" />
                    Con la <span className="font-bold text-[#2DCEA3]">Garantia ROI</span>, necesitas
                    solo{' '}
                    <span className="font-bold text-white">
                      {roiThreshold} cliente{roiThreshold > 1 ? 's' : ''} nuevo
                      {roiThreshold > 1 ? 's' : ''}
                    </span>{' '}
                    en 6 meses o tu siguiente semestre es gratis.
                  </p>
                </div>
              )}
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

              {/* Tier-specific messages */}
              {currentTier.id === 'gratis' && (
                <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-sm text-white/70">
                    <span className="font-bold text-amber-400">Plan Gratis:</span> Todas las
                    funcionalidades con publicidad. Actualiza a Basico por solo Gs 100.000/mes para
                    quitarla.
                  </p>
                </div>
              )}
              {currentTier.id === 'crecimiento' && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/60">
                    <span className="font-medium text-white">¿Necesitas hospitalizacion?</span>{' '}
                    Actualiza al Plan Profesional para acceder a modulos avanzados y WhatsApp
                    Business.
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
                <span className="font-medium text-white">Descuentos y beneficios</span>
              </div>
              <Percent
                className={`h-5 w-5 text-white/50 transition-transform ${showLoyalty ? 'rotate-180' : ''}`}
              />
            </button>

            {showLoyalty && (
              <div className="animate-in fade-in slide-in-from-top-2 mt-4 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Annual discount */}
                  <div className="rounded-xl bg-white/5 p-4">
                    <h5 className="mb-2 font-bold text-white">Pago Anual</h5>
                    <div className="text-2xl font-black text-[#2DCEA3]">
                      -{discounts.annual * 100}%
                    </div>
                    <p className="text-sm text-white/50">Pagando 12 meses por adelantado</p>
                  </div>

                  {/* Referral discount */}
                  <div className="rounded-xl bg-white/5 p-4">
                    <h5 className="mb-2 font-bold text-white">Programa de Referidos</h5>
                    <div className="text-2xl font-black text-[#F472B6]">
                      -{discounts.referral * 100}%
                    </div>
                    <p className="text-sm text-white/50">Por cada clinica que refieras (acumulable)</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-[#2DCEA3]/10 p-3">
                  <p className="text-center text-sm text-white/70">
                    <Zap className="mr-1 inline h-4 w-4 text-[#2DCEA3]" />
                    <span className="font-bold text-[#2DCEA3]">Primeras 300 clinicas:</span> Tarifa
                    bloqueada de por vida, sin aumentos futuros.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment flexibility */}
          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-white/50">
              Aceptamos pagos mensuales, semestrales y anuales.
            </p>
            <p className="text-sm text-white/40">
              Sin contratos abusivos. Cancelas cuando quieras.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

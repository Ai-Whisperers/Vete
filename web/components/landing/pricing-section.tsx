'use client';

import { useState } from 'react';
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
  Building2
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  subtitle: string;
  description: string;
  targetClinic: string;
  petsPerMonth: string;
  setupPrice: number;
  setupDisplay: string;
  monthlyPrice: number;
  commitment: string;
  features: { text: string; included: boolean; highlight?: boolean }[];
  cta: string;
  ctaMessage: string;
  popular?: boolean;
  color: string;
}

const tiers: PricingTier[] = [
  {
    id: 'semilla',
    name: 'Semilla',
    icon: <Sprout className="w-6 h-6" />,
    subtitle: 'Precio de apoyo',
    description: 'Precio especial para ayudar a clinicas nuevas a arrancar. Acceso completo a todas las funcionalidades mientras creces.',
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
    color: '#4ADE80'
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    icon: <TreeDeciduous className="w-6 h-6" />,
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
    color: '#2DCEA3'
  },
  {
    id: 'establecida',
    name: 'Establecida',
    icon: <Trees className="w-6 h-6" />,
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
    color: '#5C6BFF'
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: <Crown className="w-6 h-6" />,
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
    color: '#F59E0B'
  }
];

const loyaltyDiscounts = [
  { months: 6, discount: 5, label: '6 meses prepago' },
  { months: 12, discount: 10, label: '12 meses prepago' },
  { months: 24, discount: 15, label: '24 meses prepago' },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-PY').format(price);
}

function TierCard({ tier, isSelected, onSelect }: { tier: PricingTier; isSelected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-white/10 border-2 scale-[1.02]'
          : 'bg-white/5 border border-white/10 hover:bg-white/[0.07]'
      }`}
      style={{ borderColor: isSelected ? tier.color : undefined }}
    >
      {tier.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-[#0F172A]"
          style={{ backgroundColor: tier.color }}
        >
          Mas Popular
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
        >
          {tier.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{tier.name}</h3>
          <p className="text-xs text-white/50">{tier.subtitle}</p>
        </div>
      </div>

      <p className="text-sm text-white/60 mb-4">{tier.petsPerMonth}</p>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white">
          Gs {formatPrice(tier.monthlyPrice)}
        </span>
        <span className="text-white/50 text-sm">/mes</span>
      </div>
    </div>
  );
}

export function PricingSection() {
  const [selectedTier, setSelectedTier] = useState<string>('crecimiento');
  const [showLoyalty, setShowLoyalty] = useState(false);

  const currentTier = tiers.find(t => t.id === selectedTier) || tiers[1];

  return (
    <section id="precios" className="py-20 md:py-28 bg-gradient-to-b from-[#0F172A] via-[#131B2E] to-[#0F172A] relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-[#2DCEA3]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-[#5C6BFF]/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Planes y Precios
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Crece con nosotros
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            <span className="text-[#2DCEA3]">Apoyamos a clinicas nuevas</span> con precios accesibles para que arranquen.
            A medida que creces, tu plan crece con vos.
          </p>
        </div>

        {/* Trial Banner */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-[#2DCEA3]/20 to-[#5C6BFF]/20 border border-[#2DCEA3]/30">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#2DCEA3]/20">
                <Gift className="w-7 h-7 text-[#2DCEA3]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-1">
                  Prueba Sin Riesgo - 3 Meses Gratis
                </h3>
                <p className="text-white/60 text-sm">
                  Probalo antes de comprometerte. Si decides continuar, el setup se divide en 12 cuotas.
                  Si no, te vas sin pagar nada.
                </p>
              </div>
              <a
                href="#prueba-gratis"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2DCEA3] text-[#0F172A] font-bold rounded-full hover:bg-[#2DCEA3]/90 transition-all whitespace-nowrap"
              >
                Ver Detalles
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Tier Selector */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto">
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
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pricing Details */}
            <div
              className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border-2 backdrop-blur-sm"
              style={{ borderColor: `${currentTier.color}50` }}
            >
              {/* Tier Header */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
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
              <p className="text-white/70 mb-6">{currentTier.description}</p>

              {/* Pricing */}
              <div className="space-y-4 mb-6">
                {/* Setup */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <span className="text-white/50 text-sm">Configuracion inicial</span>
                    {currentTier.id === 'semilla' && (
                      <p className="text-xs text-[#4ADE80]">*Diferido en 12 cuotas</p>
                    )}
                  </div>
                  <span className="text-xl font-bold text-white">{currentTier.setupDisplay}</span>
                </div>

                {/* Monthly */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: `${currentTier.color}15` }}
                >
                  <span className="text-white/70">Mensualidad</span>
                  <div className="text-right">
                    <span
                      className="text-3xl font-black"
                      style={{ color: currentTier.color }}
                    >
                      Gs {formatPrice(currentTier.monthlyPrice)}
                    </span>
                    <span className="text-white/50 text-sm">/mes</span>
                  </div>
                </div>

                {/* Commitment */}
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Compromiso: {currentTier.commitment}</span>
                </div>
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/595981324569?text=${encodeURIComponent(currentTier.ctaMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-full shadow-lg transition-all hover:-translate-y-0.5 text-[#0F172A]"
                style={{
                  background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}CC)`,
                  boxShadow: `0 10px 40px ${currentTier.color}30`
                }}
              >
                <MessageCircle className="w-5 h-5" />
                {currentTier.cta}
              </a>
            </div>

            {/* Features List */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: currentTier.color }} />
                Que incluye {currentTier.name}
              </h4>

              <div className="space-y-3">
                {currentTier.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      feature.highlight ? 'bg-white/5' : ''
                    }`}
                  >
                    {feature.included ? (
                      <Check
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: currentTier.color }}
                      />
                    ) : (
                      <X className="w-5 h-5 text-white/30 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-white/80' : 'text-white/40'}>
                      {feature.text}
                    </span>
                    {feature.highlight && (
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}
                      >
                        Base
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Upgrade hint for lower tiers */}
              {currentTier.id === 'semilla' && (
                <div className="mt-6 p-4 rounded-xl bg-[#4ADE80]/10 border border-[#4ADE80]/20">
                  <p className="text-white/70 text-sm">
                    <span className="text-[#4ADE80] font-bold">Precio de apoyo:</span> Este plan existe para ayudar a clinicas nuevas a crecer.
                    Cuando tu clinica se establezca, transicionas al Plan Crecimiento o Establecida con precios estandar.
                  </p>
                </div>
              )}
              {currentTier.id === 'crecimiento' && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/60 text-sm">
                    <span className="text-white font-medium">¿Tu clinica crece?</span> Podes subir al Plan Establecida
                    en cualquier momento para acceder a funcionalidades avanzadas y soporte prioritario.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Loyalty Discounts */}
          <div className="mt-8">
            <button
              onClick={() => setShowLoyalty(!showLoyalty)}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-[#F472B6]" />
                <span className="text-white font-medium">Descuentos por lealtad</span>
              </div>
              <Percent className={`w-5 h-5 text-white/50 transition-transform ${showLoyalty ? 'rotate-180' : ''}`} />
            </button>

            {showLoyalty && (
              <div className="mt-4 p-6 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2">
                <p className="text-white/60 text-sm mb-4">
                  Pagando por adelantado, obtenes descuentos sobre la mensualidad:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {loyaltyDiscounts.map((discount) => (
                    <div
                      key={discount.months}
                      className="p-4 rounded-xl bg-white/5 text-center"
                    >
                      <div className="text-2xl font-black text-[#2DCEA3]">-{discount.discount}%</div>
                      <div className="text-white/50 text-sm">{discount.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-4 text-center">
                  Despues de 24 meses activo, obtenes 10% de descuento permanente.
                </p>
              </div>
            )}
          </div>

          {/* ROI Hint */}
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-white/70 mb-2">
              <span className="font-bold text-white">¿Vale la pena?</span>{' '}
              Con el Plan {currentTier.name}, necesitas solo{' '}
              <span className="text-[#2DCEA3] font-bold">
                {Math.ceil(currentTier.monthlyPrice / 150000)} {Math.ceil(currentTier.monthlyPrice / 150000) === 1 ? 'cliente nuevo' : 'clientes nuevos'} al mes
              </span>{' '}
              para cubrir la inversion. El resto es ganancia.
            </p>
            <a href="#calculadora" className="text-[#2DCEA3] text-sm hover:underline">
              Calcula tu ROI personalizado →
            </a>
          </div>

          {/* Payment flexibility */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm mb-2">
              Necesitas facilidades de pago? Escribinos y lo coordinamos.
            </p>
            <p className="text-white/40 text-sm">
              Sin contratos abusivos. Cancelas cuando quieras (respetando el minimo del plan).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

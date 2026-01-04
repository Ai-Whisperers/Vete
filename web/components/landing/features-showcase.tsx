'use client'

import { useState } from 'react'
import {
  Globe,
  Calendar,
  PawPrint,
  Stethoscope,
  Receipt,
  ShoppingCart,
  MessageCircle,
  Building2,
  Syringe,
  FileText,
  Pill,
  Activity,
  Heart,
  TestTube,
  Shield,
  Bell,
  Users,
  BarChart3,
  QrCode,
  Smartphone,
  Package,
  Wallet,
  Clock,
  Star,
  Send,
  Camera,
  Lock,
  Megaphone,
  ClipboardList,
  Thermometer,
  BedDouble,
  FileCheck,
  CreditCard,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

type TierLevel = 'semilla' | 'crecimiento' | 'establecida' | 'premium'

interface Feature {
  icon: React.ElementType
  title: string
  description: string
  tier: TierLevel
}

interface Category {
  id: string
  label: string
  icon: React.ElementType
  description: string
  features: Feature[]
}

const tierLabels: Record<TierLevel, { label: string; color: string }> = {
  semilla: { label: 'Semilla', color: '#22C55E' },
  crecimiento: { label: 'Crecimiento', color: '#2DCEA3' },
  establecida: { label: 'Establecida', color: '#5C6BFF' },
  premium: { label: 'Premium', color: '#F59E0B' },
}

const categories: Category[] = [
  {
    id: 'web',
    label: 'Sitio Web',
    icon: Globe,
    description: 'Tu presencia profesional en internet',
    features: [
      {
        icon: Globe,
        title: 'Pagina de Inicio Profesional',
        description: 'Hero impactante, servicios destacados, testimonios y llamadas a la accion.',
        tier: 'semilla',
      },
      {
        icon: Building2,
        title: 'Pagina "Nosotros"',
        description:
          'Historia de tu clinica, mision, equipo veterinario con fotos y especialidades.',
        tier: 'semilla',
      },
      {
        icon: FileText,
        title: 'Catalogo de Servicios',
        description:
          'Servicios organizados por categoria con descripciones, precios y reserva online.',
        tier: 'semilla',
      },
      {
        icon: Smartphone,
        title: 'Diseño 100% Responsive',
        description:
          'Se adapta a celulares, tablets y computadoras. El 80% de visitas son moviles.',
        tier: 'semilla',
      },
      {
        icon: QrCode,
        title: 'URL Personalizada',
        description: 'tunombre.vetepy.com gratis, o tu propio dominio sin costo adicional.',
        tier: 'semilla',
      },
      {
        icon: Star,
        title: 'Optimizado para Google (SEO)',
        description: 'Aparece en busquedas de "veterinaria cerca de mi". Meta tags y sitemap.',
        tier: 'crecimiento',
      },
    ],
  },
  {
    id: 'appointments',
    label: 'Citas',
    icon: Calendar,
    description: 'Sistema completo de agendamiento',
    features: [
      {
        icon: Calendar,
        title: 'Reservas Online 24/7',
        description: 'Tus clientes agendan desde el sitio web a cualquier hora.',
        tier: 'semilla',
      },
      {
        icon: Bell,
        title: 'Recordatorios Automaticos',
        description: 'WhatsApp o email automatico 24h antes. Reduce inasistencias 70%.',
        tier: 'crecimiento',
      },
      {
        icon: Users,
        title: 'Calendario del Equipo',
        description: 'Vista de citas por veterinario, dia, semana o mes.',
        tier: 'semilla',
      },
      {
        icon: Activity,
        title: 'Check-in Digital',
        description: 'Registra llegada con un click. Estado en tiempo real.',
        tier: 'crecimiento',
      },
      {
        icon: Clock,
        title: 'Gestion de Horarios',
        description: 'Horarios de atencion, bloqueos, feriados, duracion por servicio.',
        tier: 'semilla',
      },
      {
        icon: FileCheck,
        title: 'Historial de Citas',
        description: 'Registro completo de visitas con veterinario, diagnostico, seguimiento.',
        tier: 'semilla',
      },
    ],
  },
  {
    id: 'pets',
    label: 'Mascotas',
    icon: PawPrint,
    description: 'Fichas clinicas completas',
    features: [
      {
        icon: PawPrint,
        title: 'Perfil Completo',
        description: 'Foto, especie, raza, nacimiento, peso, color, microchip, condiciones.',
        tier: 'semilla',
      },
      {
        icon: Syringe,
        title: 'Carnet de Vacunas Digital',
        description: 'Registro de vacunas con fechas, lotes, proximas dosis. PDF descargable.',
        tier: 'semilla',
      },
      {
        icon: FileText,
        title: 'Historial Medico',
        description: 'Consultas, diagnosticos, tratamientos, cirugas, analisis. Timeline.',
        tier: 'semilla',
      },
      {
        icon: QrCode,
        title: 'Tags QR de Identificacion',
        description: 'Codigo QR unico. Si se pierde, quien la encuentre contacta al dueño.',
        tier: 'crecimiento',
      },
      {
        icon: Camera,
        title: 'Galeria de Fotos',
        description: 'Evolucion fotografica. Antes/despues, crecimiento, recuperaciones.',
        tier: 'crecimiento',
      },
      {
        icon: Activity,
        title: 'Curvas de Crecimiento',
        description: 'Grafico peso vs edad comparado con percentiles de la raza.',
        tier: 'establecida',
      },
    ],
  },
  {
    id: 'clinical',
    label: 'Clinicas',
    icon: Stethoscope,
    description: 'Herramientas para el veterinario',
    features: [
      {
        icon: Pill,
        title: 'Calculadora de Dosis',
        description: 'Ingresa peso y especie, obtene dosis exacta. 500+ medicamentos.',
        tier: 'semilla',
      },
      {
        icon: FileText,
        title: 'Codigos de Diagnostico',
        description: 'Base VeNom/SNOMED integrada. Busca por sintoma o codigo.',
        tier: 'crecimiento',
      },
      {
        icon: FileText,
        title: 'Recetas Digitales',
        description: 'PDF profesionales con firma digital. Envio automatico por WhatsApp.',
        tier: 'crecimiento',
      },
      {
        icon: Heart,
        title: 'Evaluacion Calidad de Vida',
        description: 'Escala HHHHHMM validada para decisiones de eutanasia.',
        tier: 'establecida',
      },
      {
        icon: Activity,
        title: 'Ciclos Reproductivos',
        description: 'Seguimiento de celo, gestacion, partos. Alertas de fechas.',
        tier: 'establecida',
      },
      {
        icon: ClipboardList,
        title: 'Plantillas de Consulta',
        description: 'Templates personalizables para consultas, emergencias, controles.',
        tier: 'crecimiento',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Facturacion',
    icon: Receipt,
    description: 'Gestion financiera profesional',
    features: [
      {
        icon: Receipt,
        title: 'Facturas Profesionales',
        description: 'Genera facturas con tu logo. Numeracion automatica, IVA calculado.',
        tier: 'crecimiento',
      },
      {
        icon: CreditCard,
        title: 'Multiples Formas de Pago',
        description: 'Efectivo, tarjeta, transferencia, QR. Pagos parciales y saldos.',
        tier: 'crecimiento',
      },
      {
        icon: BarChart3,
        title: 'Reportes Financieros',
        description: 'Ingresos por periodo, servicios mas vendidos, clientes top.',
        tier: 'establecida',
      },
      {
        icon: Wallet,
        title: 'Control de Gastos',
        description: 'Gastos por categoria. Ingresos vs egresos, rentabilidad.',
        tier: 'establecida',
      },
      {
        icon: FileText,
        title: 'Historial por Cliente',
        description: 'Lo que gasto cada cliente, facturas, pagos, saldo actual.',
        tier: 'crecimiento',
      },
      {
        icon: Send,
        title: 'Envio de Facturas',
        description: 'Envio automatico por email o WhatsApp.',
        tier: 'crecimiento',
      },
    ],
  },
  {
    id: 'store',
    label: 'Tienda',
    icon: ShoppingCart,
    description: 'E-commerce integrado',
    features: [
      {
        icon: ShoppingCart,
        title: 'Tienda en tu Sitio',
        description: 'Catalogo visible. Clientes compran alimentos y accesorios online.',
        tier: 'crecimiento',
      },
      {
        icon: Package,
        title: 'Carrito de Compras',
        description: 'Agregar productos, modificar cantidades, aplicar cupones.',
        tier: 'crecimiento',
      },
      {
        icon: CreditCard,
        title: 'Checkout Completo',
        description: 'Proceso de pago seguro. Envio, metodo de pago, confirmacion.',
        tier: 'crecimiento',
      },
      {
        icon: Star,
        title: 'Reseñas de Productos',
        description: 'Clientes califican y comentan. Genera confianza.',
        tier: 'establecida',
      },
      {
        icon: Megaphone,
        title: 'Cupones y Promociones',
        description: 'Descuentos porcentaje o monto. Campañas de temporada.',
        tier: 'establecida',
      },
      {
        icon: Package,
        title: 'Control de Stock',
        description: 'Stock en tiempo real. Alertas de bajo inventario.',
        tier: 'crecimiento',
      },
    ],
  },
  {
    id: 'communication',
    label: 'Mensajes',
    icon: MessageCircle,
    description: 'Conecta con tus clientes',
    features: [
      {
        icon: MessageCircle,
        title: 'Chat Interno',
        description: 'Mensajeria clinica-dueños. Historial guardado.',
        tier: 'crecimiento',
      },
      {
        icon: Smartphone,
        title: 'WhatsApp Business',
        description: 'Integracion bidireccional. Envia y recibe en la plataforma.',
        tier: 'establecida',
      },
      {
        icon: Bell,
        title: 'Notificaciones Push',
        description: 'Alertas instantaneas. Nueva cita, mensaje, stock bajo.',
        tier: 'crecimiento',
      },
      {
        icon: FileText,
        title: 'Templates de Mensajes',
        description: 'Respuestas predefinidas para preguntas frecuentes.',
        tier: 'crecimiento',
      },
      {
        icon: Megaphone,
        title: 'Campañas Masivas',
        description: 'Recordatorios de vacunas, promociones, cumpleaños.',
        tier: 'establecida',
      },
      {
        icon: Send,
        title: 'Recordatorios Automaticos',
        description: 'Vacunas proximas, controles anuales, desparasitaciones.',
        tier: 'crecimiento',
      },
    ],
  },
  {
    id: 'advanced',
    label: 'Avanzado',
    icon: Building2,
    description: 'Para clinicas grandes',
    features: [
      {
        icon: BedDouble,
        title: 'Hospitalizacion',
        description: 'Jaulas/kennels, vitales, medicacion, alimentacion, visitas.',
        tier: 'establecida',
      },
      {
        icon: TestTube,
        title: 'Laboratorio',
        description: 'Ordenes de analisis, carga de resultados, rangos, alertas.',
        tier: 'establecida',
      },
      {
        icon: Shield,
        title: 'Seguros de Mascotas',
        description: 'Polizas, reclamos, pre-autorizaciones, reembolsos.',
        tier: 'premium',
      },
      {
        icon: FileCheck,
        title: 'Consentimientos Digitales',
        description: 'Templates para cirugias, anestesia. Firma digital.',
        tier: 'establecida',
      },
      {
        icon: Thermometer,
        title: 'Hoja de Anestesia',
        description: 'Parametros durante cirugia. Tiempo, drogas, oxigenacion.',
        tier: 'premium',
      },
      {
        icon: BarChart3,
        title: 'Epidemiologia',
        description: 'Mapa de calor de enfermedades en tu zona.',
        tier: 'premium',
      },
    ],
  },
]

function TierBadge({ tier }: { tier: TierLevel }) {
  const { label, color } = tierLabels[tier]
  return (
    <span
      className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  )
}

export function FeaturesShowcase() {
  const [activeCategory, setActiveCategory] = useState('web')

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0]

  return (
    <section
      id="caracteristicas"
      className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#131B2E] py-16 md:py-24"
    >
      {/* Gradient orb */}
      <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#5C6BFF]/10 blur-[150px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2DCEA3]/20 bg-[#2DCEA3]/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#2DCEA3]" />
            <span className="text-sm font-bold text-[#2DCEA3]">Funcionalidades</span>
          </div>
          <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl">
            Todo lo que tu clinica necesita
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-white/60 md:text-base lg:text-lg">
            Mas de 60 funcionalidades organizadas en modulos. Explora cada categoria.
          </p>
        </div>

        {/* Category Tabs - Scrollable on mobile */}
        <div className="relative mb-6 md:mb-8">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-all md:px-4 md:text-sm ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <category.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category description */}
        <p className="mb-6 text-center text-sm text-white/50 md:mb-8">
          {currentCategory.description}
        </p>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {currentCategory.features.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:border-[#2DCEA3]/30 hover:bg-white/[0.05] md:p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#2DCEA3]/10 transition-colors group-hover:bg-[#2DCEA3]/20 md:h-10 md:w-10">
                  <feature.icon className="h-4 w-4 text-[#2DCEA3] md:h-5 md:w-5" />
                </div>
                <TierBadge tier={feature.tier} />
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-white md:text-base">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-white/50 md:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tier legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:mt-10 md:gap-4">
          {(Object.keys(tierLabels) as TierLevel[]).map((tier) => (
            <div key={tier} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: tierLabels[tier].color }}
              />
              <span className="text-xs text-white/40">{tierLabels[tier].label}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center md:mt-10">
          <a
            href="/adris"
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 md:px-6 md:py-3 md:text-base"
          >
            <Globe className="h-4 w-4 text-[#2DCEA3]" />
            Explorar demo en vivo
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  )
}

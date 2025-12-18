'use client';

import { useState } from 'react';
import {
  Globe, Calendar, PawPrint, Stethoscope, Receipt, ShoppingCart,
  MessageCircle, Building2, Syringe, FileText, Pill, Activity,
  Heart, TestTube, Shield, Bell, Users, BarChart3, QrCode, Smartphone,
  Package, Wallet, Clock, Star, Send, Camera, Lock, Megaphone,
  ClipboardList, Thermometer, BedDouble, FileCheck, CreditCard
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  features: Feature[];
}

const categories: Category[] = [
  {
    id: 'web',
    label: 'Sitio Web',
    icon: Globe,
    description: 'Tu presencia profesional en internet',
    features: [
      { icon: Globe, title: 'Página de Inicio Profesional', description: 'Hero impactante, servicios destacados, testimonios de clientes, galería de fotos y llamadas a la acción efectivas.' },
      { icon: Building2, title: 'Página "Nosotros"', description: 'Historia de tu clínica, misión y visión, equipo veterinario con fotos, títulos y especialidades de cada profesional.' },
      { icon: FileText, title: 'Catálogo de Servicios Completo', description: 'Todos tus servicios organizados por categoría, con descripciones detalladas, precios y opción de reserva online.' },
      { icon: Smartphone, title: 'Diseño 100% Responsive', description: 'Se adapta perfectamente a celulares, tablets y computadoras. El 80% de tus visitas vienen del móvil.' },
      { icon: QrCode, title: 'Tu URL Personalizada', description: 'tunombre.vetepy.com gratis, o configuramos tu propio dominio (www.tuvet.com.py) sin costo adicional.' },
      { icon: Star, title: 'Optimizado para Google (SEO)', description: 'Tu sitio aparece en búsquedas de "veterinaria cerca de mí". Meta tags, sitemap y estructura optimizada.' },
    ]
  },
  {
    id: 'appointments',
    label: 'Citas',
    icon: Calendar,
    description: 'Sistema completo de agendamiento',
    features: [
      { icon: Calendar, title: 'Reservas Online 24/7', description: 'Tus clientes agendan desde el sitio web a cualquier hora. Eligen fecha, hora, servicio y veterinario.' },
      { icon: Bell, title: 'Recordatorios Automáticos', description: 'WhatsApp o email automático 24h antes de cada cita. Reduce las inasistencias hasta un 70%.' },
      { icon: Users, title: 'Calendario del Equipo', description: 'Vista de citas por veterinario, día, semana o mes. Gestión de disponibilidad de cada profesional.' },
      { icon: Activity, title: 'Check-in Digital', description: 'Registrá llegada del paciente con un click. Estado en tiempo real: esperando, en consulta, finalizado.' },
      { icon: Clock, title: 'Gestión de Horarios', description: 'Definí horarios de atención, bloqueos, feriados. Control de duración por tipo de servicio.' },
      { icon: FileCheck, title: 'Historial de Citas', description: 'Registro completo de todas las visitas del paciente. Motivo, veterinario, diagnóstico, seguimiento.' },
    ]
  },
  {
    id: 'pets',
    label: 'Mascotas',
    icon: PawPrint,
    description: 'Fichas clínicas completas',
    features: [
      { icon: PawPrint, title: 'Perfil Completo de Mascota', description: 'Foto, nombre, especie, raza, fecha de nacimiento, peso actual, color, microchip, condiciones especiales.' },
      { icon: Syringe, title: 'Carnet de Vacunas Digital', description: 'Registro de todas las vacunas con fechas, lotes, próximas dosis. PDF descargable para el dueño.' },
      { icon: FileText, title: 'Historial Médico Completo', description: 'Todas las consultas, diagnósticos, tratamientos, cirugías, análisis. Timeline cronológico.' },
      { icon: QrCode, title: 'Tags QR de Identificación', description: 'Código QR único para cada mascota. Si se pierde, quien la encuentre escanea y contacta al dueño.' },
      { icon: Camera, title: 'Galería de Fotos', description: 'Evolución fotográfica del paciente. Antes/después de tratamientos, crecimiento, recuperaciones.' },
      { icon: Activity, title: 'Curvas de Crecimiento', description: 'Gráfico de peso vs edad comparado con percentiles de la raza. Detectá problemas de nutrición.' },
    ]
  },
  {
    id: 'clinical',
    label: 'Herramientas Clínicas',
    icon: Stethoscope,
    description: 'Todo lo que el veterinario necesita',
    features: [
      { icon: Pill, title: 'Calculadora de Dosis', description: 'Ingresá peso y especie, obtené dosis exacta. Base de datos de 500+ medicamentos veterinarios comunes.' },
      { icon: FileText, title: 'Códigos de Diagnóstico', description: 'Base de datos VeNom/SNOMED integrada. Buscá por síntoma o código, autocompletado inteligente.' },
      { icon: FileText, title: 'Recetas Digitales con Firma', description: 'Genera recetas PDF profesionales con tu firma digital. Envío automático por WhatsApp al dueño.' },
      { icon: Heart, title: 'Evaluación Calidad de Vida', description: 'Escala HHHHHMM validada para decisiones de eutanasia. Puntaje objetivo para conversaciones difíciles.' },
      { icon: Activity, title: 'Ciclos Reproductivos', description: 'Seguimiento de celo, gestación, partos. Alertas de fechas importantes para criaderos.' },
      { icon: ClipboardList, title: 'Plantillas de Consulta', description: 'Templates personalizables para consultas de rutina, emergencias, control post-operatorio.' },
    ]
  },
  {
    id: 'billing',
    label: 'Facturación',
    icon: Receipt,
    description: 'Gestión financiera profesional',
    features: [
      { icon: Receipt, title: 'Facturas Profesionales', description: 'Genera facturas con tu logo en segundos. Numeración automática, items detallados, IVA calculado.' },
      { icon: CreditCard, title: 'Múltiples Formas de Pago', description: 'Efectivo, tarjeta, transferencia, QR. Registrá pagos parciales y saldos pendientes.' },
      { icon: BarChart3, title: 'Reportes Financieros', description: 'Ingresos por día/semana/mes, servicios más vendidos, clientes top, tendencias de facturación.' },
      { icon: Wallet, title: 'Control de Gastos', description: 'Registrá gastos operativos por categoría. Compará ingresos vs egresos, calculá rentabilidad.' },
      { icon: FileText, title: 'Historial por Cliente', description: 'Todo lo que gastó cada cliente, facturas emitidas, pagos recibidos, saldo actual.' },
      { icon: Send, title: 'Envío de Facturas', description: 'Envío automático por email o WhatsApp. El cliente recibe su factura al instante.' },
    ]
  },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: Package,
    description: 'Control total de stock',
    features: [
      { icon: Package, title: 'Catálogo de Productos', description: 'Medicamentos, alimentos, accesorios. Código, nombre, presentación, precio de costo y venta.' },
      { icon: BarChart3, title: 'Stock en Tiempo Real', description: 'Cuántas unidades tenés de cada producto. Descuenta automáticamente al facturar.' },
      { icon: Bell, title: 'Alertas de Stock Bajo', description: 'Notificación cuando un producto llega al punto de reorden. Nunca más te quedés sin stock.' },
      { icon: Activity, title: 'Movimientos de Inventario', description: 'Historial de entradas, salidas, ajustes, mermas. Trazabilidad completa de cada producto.' },
      { icon: Receipt, title: 'Costo Promedio Ponderado', description: 'Cálculo automático del costo real de cada producto considerando todas las compras.' },
      { icon: FileText, title: 'Reportes de Inventario', description: 'Valor total del stock, productos sin movimiento, rotación, productos más vendidos.' },
    ]
  },
  {
    id: 'store',
    label: 'Tienda Online',
    icon: ShoppingCart,
    description: 'E-commerce integrado (opcional)',
    features: [
      { icon: ShoppingCart, title: 'Tienda en tu Sitio Web', description: 'Catálogo de productos visible para tus clientes. Pueden comprar alimentos y accesorios online.' },
      { icon: Package, title: 'Carrito de Compras', description: 'Agregar productos, modificar cantidades, aplicar cupones. Experiencia de compra profesional.' },
      { icon: CreditCard, title: 'Checkout Completo', description: 'Proceso de pago seguro. Datos de envío, selección de método de pago, confirmación.' },
      { icon: Star, title: 'Reseñas de Productos', description: 'Tus clientes pueden calificar y comentar productos. Genera confianza para nuevos compradores.' },
      { icon: Heart, title: 'Lista de Deseos', description: 'Los clientes guardan productos favoritos para comprar después. Oportunidad de remarketing.' },
      { icon: Megaphone, title: 'Cupones y Promociones', description: 'Creá descuentos por porcentaje o monto fijo. Campañas de temporada, Black Friday, etc.' },
    ]
  },
  {
    id: 'communication',
    label: 'Comunicación',
    icon: MessageCircle,
    description: 'Conectá con tus clientes',
    features: [
      { icon: MessageCircle, title: 'Chat Interno', description: 'Mensajería directa entre la clínica y los dueños de mascotas. Historial de conversaciones guardado.' },
      { icon: Smartphone, title: 'WhatsApp Business', description: 'Integración bidireccional. Enviá mensajes desde el sistema, recibí respuestas en la plataforma.' },
      { icon: Bell, title: 'Notificaciones Push', description: 'Alertas instantáneas para el equipo. Nueva cita, mensaje de cliente, stock bajo, etc.' },
      { icon: FileText, title: 'Templates de Mensajes', description: 'Respuestas predefinidas para preguntas frecuentes. Ahorrá tiempo respondiendo lo mismo.' },
      { icon: Megaphone, title: 'Campañas Masivas', description: 'Enviá recordatorios de vacunas, promociones, felicitaciones de cumpleaños a todos tus clientes.' },
      { icon: Send, title: 'Recordatorios Automáticos', description: 'El sistema envía recordatorios de vacunas próximas, controles anuales, desparasitaciones.' },
    ]
  },
  {
    id: 'staff',
    label: 'Equipo',
    icon: Users,
    description: 'Gestión de personal',
    features: [
      { icon: Users, title: 'Perfiles de Staff', description: 'Cada miembro del equipo con su foto, especialidad, matrícula, horarios de atención.' },
      { icon: Lock, title: 'Roles y Permisos', description: 'Definí qué puede hacer cada uno: admin ve todo, veterinario ve pacientes, recepcionista ve citas.' },
      { icon: Calendar, title: 'Horarios por Veterinario', description: 'Cada profesional tiene su agenda. Los clientes eligen con quién quieren atenderse.' },
      { icon: Clock, title: 'Gestión de Vacaciones', description: 'Solicitudes de días libres, aprobación, bloqueo automático de agenda durante ausencias.' },
      { icon: BarChart3, title: 'Productividad por Profesional', description: 'Cuántas consultas atendió cada veterinario, facturación generada, rating de clientes.' },
      { icon: FileText, title: 'Auditoría de Acciones', description: 'Log completo de quién hizo qué y cuándo. Trazabilidad total para resolución de disputas.' },
    ]
  },
  {
    id: 'advanced',
    label: 'Módulos Avanzados',
    icon: Building2,
    description: 'Para clínicas más grandes',
    features: [
      { icon: BedDouble, title: 'Hospitalización', description: 'Gestión de jaulas/kennels, registro de vitales (temp, FC, FR), medicación, alimentación, visitas.' },
      { icon: TestTube, title: 'Laboratorio', description: 'Órdenes de análisis, carga de resultados, rangos de referencia, alertas de valores anormales.' },
      { icon: Shield, title: 'Seguros de Mascotas', description: 'Registro de pólizas, envío de reclamos, pre-autorizaciones, seguimiento de reembolsos.' },
      { icon: FileCheck, title: 'Consentimientos Digitales', description: 'Templates de consentimiento para cirugías, anestesia, eutanasia. Firma digital del dueño.' },
      { icon: Thermometer, title: 'Hoja de Anestesia', description: 'Registro de parámetros durante cirugía. Tiempo, drogas, oxigenación, recuperación.' },
      { icon: BarChart3, title: 'Epidemiología', description: 'Mapa de calor de enfermedades reportadas en tu zona. Contribuí a la salud pública veterinaria.' },
    ]
  }
];

export function FeaturesShowcase() {
  const [activeCategory, setActiveCategory] = useState('web');

  const currentCategory = categories.find(c => c.id === activeCategory) || categories[0];

  return (
    <section id="caracteristicas" className="py-20 md:py-28 bg-gradient-to-b from-[#0F172A] to-[#131B2E] relative overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#5C6BFF]/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Funcionalidades
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Todo lo que tu clínica necesita
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            Más de 100 funcionalidades organizadas en módulos. Desde el sitio web hasta gestión hospitalaria.
            Explorá cada categoría para ver todo lo que podés hacer.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </button>
          ))}
        </div>

        {/* Category description */}
        <p className="text-center text-white/50 mb-8">
          {currentCategory.description}
        </p>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {currentCategory.features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#2DCEA3]/30 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-[#2DCEA3]/10 flex items-center justify-center mb-3 group-hover:bg-[#2DCEA3]/20 transition-colors">
                <feature.icon className="w-5 h-5 text-[#2DCEA3]" />
              </div>
              <h3 className="text-white font-bold mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center">
          <p className="text-white/40 text-sm mb-4">
            {categories.length} categorías · {categories.reduce((acc, c) => acc + c.features.length, 0)}+ funcionalidades
          </p>
          <a
            href="/adris"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 transition-all"
          >
            <Globe className="w-4 h-4 text-[#2DCEA3]" />
            Explorar demo en vivo
          </a>
        </div>
      </div>
    </section>
  );
}

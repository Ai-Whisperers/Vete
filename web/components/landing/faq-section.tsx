'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: 'general' | 'technical' | 'pricing' | 'features'
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'general',
    question: '¿Como funciona VetePy exactamente?',
    answer:
      'VetePy es una plataforma de sitios web veterinarios compartida. Construimos y mantenemos una infraestructura profesional, y cada clinica recibe su propio sitio web personalizado con su marca, colores y contenido. Es como tener un departamento de tecnologia propio, pero compartiendo los costos entre multiples clinicas.',
  },
  {
    category: 'general',
    question: '¿Como obtengo mi propia URL?',
    answer:
      'Al unirte recibis automaticamente una URL como tunombre.vetepy.com. Si preferis usar tu propio dominio (www.miveterinaria.com.py), solo necesitas comprarlo (aprox. Gs 150.000/año) y nosotros lo configuramos gratis. Tu sitio funcionara con cualquiera de las dos opciones.',
  },
  {
    category: 'general',
    question: '¿Cuanto tiempo tarda en estar listo mi sitio?',
    answer:
      'Entre 3-7 dias habiles desde que nos envias toda la informacion: logo, fotos, descripcion de servicios con precios, datos de contacto, y horarios. Si ya tenes todo organizado, puede ser mas rapido. Te guiamos paso a paso sobre que necesitamos.',
  },
  {
    category: 'general',
    question: '¿Puedo ver una demo antes de contratar?',
    answer:
      'Si! Tenemos un sitio demo completo en vivo (vetepy.vercel.app/adris) que podes explorar libremente. Tambien podemos hacer una videollamada para mostrarte el sistema en detalle y responder todas tus preguntas antes de que tomes una decision.',
  },

  // Customization
  {
    category: 'general',
    question: '¿Puedo personalizar los colores y el diseno?',
    answer:
      'Absolutamente. Cada clinica tiene su propia identidad visual completa: tu logo, tus colores corporativos, tus fotos, tu contenido. Aunque todas las clinicas usan la misma plataforma, cada una se ve totalmente unica y profesional. Nadie sabe que es el mismo sistema.',
  },
  {
    category: 'general',
    question: '¿Que pasa si necesito hacer cambios en mi sitio?',
    answer:
      'Cambios de contenido (textos, precios, horarios, fotos) nos los pedis por WhatsApp y los hacemos rapido. Ajustes menores estan incluidos. Si queres funcionalidades nuevas o desarrollos especificos para tu clinica, te pasamos un presupuesto. Siempre somos transparentes con los costos.',
  },

  // Technical
  {
    category: 'technical',
    question: '¿Mis datos estan seguros?',
    answer:
      'Usamos tecnologia de nivel bancario: encriptacion SSL, bases de datos aisladas por clinica (tus datos nunca se mezclan con los de otras clinicas), backups diarios automaticos, servidores en la nube de Supabase y Vercel. Cumplimos con estandares internacionales de seguridad de datos.',
  },
  {
    category: 'technical',
    question: '¿Que pasa con mis datos si cancelo?',
    answer:
      'Tus datos son tuyos. Si decidis cancelar, te exportamos toda la informacion de tus clientes, mascotas e historial medico en un formato estandar (CSV/Excel) para que puedas llevartela. No te quedas atrapado con nosotros.',
  },
  {
    category: 'technical',
    question: '¿Puedo migrar datos de otro sistema?',
    answer:
      'Si, te ayudamos con la migracion. Si tenes datos en Excel, otro software veterinario, o incluso en fichas de papel, trabajamos juntos para importar la informacion a VetePy. El costo de migracion depende del volumen y formato de los datos.',
  },
  {
    category: 'technical',
    question: '¿Necesito saber de tecnologia para usar VetePy?',
    answer:
      'Para nada. Si sabes usar WhatsApp y Facebook, podes usar VetePy. La plataforma esta diseñada para ser intuitiva. Y si tenes alguna duda, nuestro soporte esta disponible por WhatsApp para guiarte paso a paso.',
  },
  {
    category: 'technical',
    question: '¿El sitio se ve bien en celulares?',
    answer:
      'Si, el diseño es 100% responsive. Se adapta perfectamente a celulares, tablets y computadoras. Esto es critico porque mas del 80% de tus visitantes van a llegar desde el movil. Todo esta optimizado para que cargue rapido incluso con conexiones lentas.',
  },

  // Features
  {
    category: 'features',
    question: '¿Como funciona el sistema de citas?',
    answer:
      'Los clientes entran a tu sitio, ven los horarios disponibles, eligen fecha, hora, servicio y veterinario, y confirman. Reciben confirmacion por email/WhatsApp, y un recordatorio automatico 24h antes. Vos ves todas las citas en un calendario con vista por dia, semana o mes.',
  },
  {
    category: 'features',
    question: '¿Puedo tener diferentes niveles de acceso para mi equipo?',
    answer:
      'Si. Hay 3 roles: Admin (ve y hace todo), Veterinario (ve pacientes, crea recetas, historial), y Recepcionista (ve citas, datos de clientes). Cada persona tiene su usuario y contraseña, y solo accede a lo que corresponde a su rol.',
  },
  {
    category: 'features',
    question: '¿Tienen integracion con WhatsApp?',
    answer:
      'Si. El plan base incluye botones de WhatsApp en tu sitio para que los clientes te escriban facil. Para integracion avanzada (envio automatico de recordatorios por WhatsApp Business API, mensajeria bidireccional desde el sistema) esta incluido en el Plan Establecida o disponible como modulo adicional.',
  },
  {
    category: 'features',
    question: '¿El sitio aparece en Google?',
    answer:
      'Si. Tu sitio esta optimizado para SEO: estructura correcta, meta tags, sitemap, velocidad de carga rapida. Esto ayuda a que aparezcas en busquedas como "veterinaria en [tu ciudad]". El posicionamiento mejora con el tiempo a medida que tu sitio recibe visitas y actualizaciones.',
  },
  {
    category: 'features',
    question: '¿Puedo vender productos online?',
    answer:
      'Si, con el modulo de tienda online. Incluye catalogo de productos, carrito de compras, checkout, gestion de stock, y cupones de descuento. Ideal para vender alimentos, accesorios y medicamentos de venta libre. Disponible en Plan Crecimiento en adelante.',
  },

  // Pricing - NEW SECTION
  {
    category: 'pricing',
    question: '¿Que plan me conviene?',
    answer:
      'Depende del tamaño de tu clinica. Plan Semilla es ideal para clinicas nuevas o pequeñas (menos de 50 pacientes/mes) - tiene el menor costo y el setup es diferido. Plan Crecimiento es nuestro mas popular, para clinicas de 50-150 pacientes/mes. Plan Establecida es para clinicas grandes (150+ pacientes) que quieren todas las funcionalidades y soporte prioritario. Usa nuestro quiz de precios o calculadora de ROI para ver cual te conviene.',
  },
  {
    category: 'pricing',
    question: '¿Ofrecen prueba gratis?',
    answer:
      'Si! Ofrecemos 3 meses de prueba totalmente gratis. Nosotros construimos tu sitio web durante ese periodo, vos lo probas con tus clientes, y si te gusta, continuas. Si no te convence, te vas sin pagar nada. Es nuestro riesgo, no el tuyo.',
  },
  {
    category: 'pricing',
    question: '¿Como funciona el pago del setup si uso la prueba gratis?',
    answer:
      'Si decides continuar despues de los 3 meses de prueba, el costo de configuracion se divide en 12 cuotas sin interes que se suman a tu mensualidad. Por ejemplo, con Plan Crecimiento (setup Gs 500.000): Gs 200.000 + Gs 41.667 = Gs 241.667/mes durante 12 meses. Despues, solo la mensualidad normal.',
  },
  {
    category: 'pricing',
    question: '¿Hay descuentos por pago anticipado?',
    answer:
      'Si. Ofrecemos descuentos sobre la mensualidad: 5% si pagas 6 meses adelantado, 10% por 12 meses, 15% por 24 meses. Ademas, despues de 24 meses como cliente activo, obtenes un 10% de descuento permanente como reconocimiento a tu lealtad.',
  },
  {
    category: 'pricing',
    question: '¿Por que las clinicas grandes pagan mas?',
    answer:
      'Nuestra filosofia es apoyar a clinicas nuevas para que crezcan. El Plan Semilla tiene precio de apoyo especial para startups veterinarias. Una vez que tu clinica se establece y tiene mas pacientes, transicionas a planes con precios estandar. Es justo: las clinicas establecidas pueden pagar mas, y eso nos permite subsidiar a las nuevas. Todos ganan.',
  },
  {
    category: 'pricing',
    question: '¿Puedo cambiar de plan?',
    answer:
      'Si, en cualquier momento. Si tu clinica crece, podes subir de plan y acceder a mas funcionalidades. Si necesitas bajar temporalmente, tambien es posible. Solo ajustamos la mensualidad desde el mes siguiente. No hay penalidades por cambiar.',
  },
  {
    category: 'pricing',
    question: '¿Que incluye el soporte tecnico?',
    answer:
      'Depende del plan. Semilla tiene soporte por email. Crecimiento tiene WhatsApp en horario laboral. Establecida y Premium tienen soporte prioritario 24/7. En todos los casos, si algo no funciona, lo arreglamos. Si queres funcionalidades nuevas, las evaluamos y te cotizamos si es algo especifico.',
  },
  {
    category: 'pricing',
    question: '¿Hay contrato de permanencia?',
    answer:
      'Depende del plan. Semilla requiere 12 meses minimo (porque el setup es diferido). Crecimiento requiere 6 meses. Establecida y Premium no tienen minimo. Si cancelas antes del minimo, hay una pequeña compensacion por la inversion que hicimos en tu setup.',
  },
  {
    category: 'pricing',
    question: '¿Por que es tan barato comparado con hacer un sitio desde cero?',
    answer:
      'Porque los costos de desarrollo y mantenimiento se reparten entre todas las clinicas de la red. En vez de que cada veterinaria pague Gs 10-15 millones por un desarrollo propio, compartimos una plataforma profesional y todos pagamos una fraccion. Es el poder de la economia de escala.',
  },
]

function FAQItemComponent({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-white transition-colors group-hover:text-[#2DCEA3]">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-white/50 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#2DCEA3]' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] pb-5' : 'max-h-0'
        }`}
      >
        <p className="pr-8 leading-relaxed text-white/60">{item.answer}</p>
      </div>
    </div>
  )
}

type CategoryFilter = 'all' | 'general' | 'technical' | 'pricing' | 'features'

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'Todas',
  general: 'General',
  technical: 'Tecnico',
  pricing: 'Precios',
  features: 'Funcionalidades',
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')

  const filteredFAQs =
    activeCategory === 'all' ? faqs : faqs.filter((faq) => faq.category === activeCategory)

  return (
    <section id="faq" className="relative overflow-hidden bg-[#0F172A] py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-[#2DCEA3]">
            Preguntas Frecuentes
          </span>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            Todo lo que queres saber
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Respuestas honestas a las preguntas mas comunes. Si no encontras lo que buscas,
            escribinos.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category)
                setOpenIndex(null)
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-[#2DCEA3] text-[#0F172A]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 md:px-8">
            {filteredFAQs.map((faq, idx) => (
              <FAQItemComponent
                key={`${activeCategory}-${idx}`}
                item={faq}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-white/50">No hay preguntas en esta categoria.</p>
            </div>
          )}
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <HelpCircle className="h-8 w-8 text-[#2DCEA3]" />
            <div>
              <p className="mb-1 font-bold text-white">¿Tenes otra pregunta?</p>
              <p className="mb-4 text-sm text-white/50">
                No te quedes con dudas. Escribinos y te respondemos rapido.
              </p>
              <a
                href="https://wa.me/595981324569?text=Hola!%20Tengo%20una%20pregunta%20sobre%20VetePy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] px-5 py-2.5 text-sm font-bold text-[#0F172A] transition-all hover:shadow-lg hover:shadow-[#2DCEA3]/20"
              >
                Preguntar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

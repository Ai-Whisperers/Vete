'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'pricing' | 'features';
}

const faqs: FAQItem[] = [
  // General
  {
    category: 'general',
    question: '¿Cómo funciona VetePy exactamente?',
    answer: 'VetePy es una plataforma de sitios web veterinarios compartida. Construimos y mantenemos una infraestructura profesional, y cada clínica recibe su propio sitio web personalizado con su marca, colores y contenido. Es como tener un departamento de tecnología propio, pero compartiendo los costos entre múltiples clínicas.'
  },
  {
    category: 'general',
    question: '¿Cómo obtengo mi propia URL?',
    answer: 'Al unirte recibís automáticamente una URL como tunombre.vetepy.com. Si preferís usar tu propio dominio (www.miveterinaria.com.py), solo necesitás comprarlo (aprox. ₲150.000/año) y nosotros lo configuramos gratis. Tu sitio funcionará con cualquiera de las dos opciones.'
  },
  {
    category: 'general',
    question: '¿Cuánto tiempo tarda en estar listo mi sitio?',
    answer: 'Entre 3-7 días hábiles desde que nos enviás toda la información: logo, fotos, descripción de servicios con precios, datos de contacto, y horarios. Si ya tenés todo organizado, puede ser más rápido. Te guiamos paso a paso sobre qué necesitamos.'
  },
  {
    category: 'general',
    question: '¿Puedo ver una demo antes de contratar?',
    answer: '¡Sí! Tenemos un sitio demo completo en vivo (vetepy.vercel.app/adris) que podés explorar libremente. También podemos hacer una videollamada para mostrarte el sistema en detalle y responder todas tus preguntas antes de que tomes una decisión.'
  },

  // Customization
  {
    category: 'general',
    question: '¿Puedo personalizar los colores y el diseño?',
    answer: 'Absolutamente. Cada clínica tiene su propia identidad visual completa: tu logo, tus colores corporativos, tus fotos, tu contenido. Aunque todas las clínicas usan la misma plataforma, cada una se ve totalmente única y profesional. Nadie sabe que es el mismo sistema.'
  },
  {
    category: 'general',
    question: '¿Qué pasa si necesito hacer cambios en mi sitio?',
    answer: 'Cambios de contenido (textos, precios, horarios, fotos) nos los pedís por WhatsApp y los hacemos rápido. Ajustes menores están incluidos. Si querés funcionalidades nuevas o desarrollos específicos para tu clínica, te pasamos un presupuesto. Siempre somos transparentes con los costos.'
  },

  // Technical
  {
    category: 'technical',
    question: '¿Mis datos están seguros?',
    answer: 'Usamos tecnología de nivel bancario: encriptación SSL, bases de datos aisladas por clínica (tus datos nunca se mezclan con los de otras clínicas), backups diarios automáticos, servidores en la nube de Supabase y Vercel. Cumplimos con estándares internacionales de seguridad de datos.'
  },
  {
    category: 'technical',
    question: '¿Qué pasa con mis datos si cancelo?',
    answer: 'Tus datos son tuyos. Si decidís cancelar, te exportamos toda la información de tus clientes, mascotas e historial médico en un formato estándar (CSV/Excel) para que puedas llevártela. No te quedás atrapado con nosotros.'
  },
  {
    category: 'technical',
    question: '¿Puedo migrar datos de otro sistema?',
    answer: 'Sí, te ayudamos con la migración. Si tenés datos en Excel, otro software veterinario, o incluso en fichas de papel, trabajamos juntos para importar la información a VetePy. El costo de migración depende del volumen y formato de los datos.'
  },
  {
    category: 'technical',
    question: '¿Necesito saber de tecnología para usar VetePy?',
    answer: 'Para nada. Si sabés usar WhatsApp y Facebook, podés usar VetePy. La plataforma está diseñada para ser intuitiva. Y si tenés alguna duda, nuestro soporte está disponible por WhatsApp para guiarte paso a paso.'
  },
  {
    category: 'technical',
    question: '¿El sitio se ve bien en celulares?',
    answer: 'Sí, el diseño es 100% responsive. Se adapta perfectamente a celulares, tablets y computadoras. Esto es crítico porque más del 80% de tus visitantes van a llegar desde el móvil. Todo está optimizado para que cargue rápido incluso con conexiones lentas.'
  },

  // Features
  {
    category: 'features',
    question: '¿Cómo funciona el sistema de citas?',
    answer: 'Los clientes entran a tu sitio, ven los horarios disponibles, eligen fecha, hora, servicio y veterinario, y confirman. Reciben confirmación por email/WhatsApp, y un recordatorio automático 24h antes. Vos ves todas las citas en un calendario con vista por día, semana o mes.'
  },
  {
    category: 'features',
    question: '¿Puedo tener diferentes niveles de acceso para mi equipo?',
    answer: 'Sí. Hay 3 roles: Admin (ve y hace todo), Veterinario (ve pacientes, crea recetas, historial), y Recepcionista (ve citas, datos de clientes). Cada persona tiene su usuario y contraseña, y solo accede a lo que corresponde a su rol.'
  },
  {
    category: 'features',
    question: '¿Tienen integración con WhatsApp?',
    answer: 'Sí. El plan base incluye botones de WhatsApp en tu sitio para que los clientes te escriban fácil. Para integración avanzada (envío automático de recordatorios por WhatsApp Business API, mensajería bidireccional desde el sistema) hay un módulo opcional con costo adicional.'
  },
  {
    category: 'features',
    question: '¿El sitio aparece en Google?',
    answer: 'Sí. Tu sitio está optimizado para SEO: estructura correcta, meta tags, sitemap, velocidad de carga rápida. Esto ayuda a que aparezcas en búsquedas como "veterinaria en [tu ciudad]". El posicionamiento mejora con el tiempo a medida que tu sitio recibe visitas y actualizaciones.'
  },
  {
    category: 'features',
    question: '¿Puedo vender productos online?',
    answer: 'Sí, con el módulo de tienda online (opcional, cotización aparte). Incluye catálogo de productos, carrito de compras, checkout, gestión de stock, y cupones de descuento. Ideal para vender alimentos, accesorios y medicamentos de venta libre.'
  },

  // Pricing & Support
  {
    category: 'pricing',
    question: '¿Qué incluye el soporte técnico?',
    answer: 'Soporte por WhatsApp para dudas y problemas. Si algo no funciona, lo arreglamos. Si querés una funcionalidad nueva, la evaluamos: si beneficia a todos, la agregamos a la plataforma; si es algo específico para tu clínica, te cotizamos el desarrollo. Siempre te explicamos antes de cobrar algo.'
  },
  {
    category: 'pricing',
    question: '¿Hay contrato de permanencia?',
    answer: 'No. Podés cancelar cuando quieras. Si por algún motivo VetePy no es para vos, cancelás y listo. Te exportamos tus datos y ya. Creemos que la mejor forma de retenerte es dándote un buen servicio, no obligándote con contratos.'
  },
  {
    category: 'pricing',
    question: '¿Puedo pagar en cuotas?',
    answer: 'Sí, podemos coordinar un plan de pago para la configuración inicial. Escribinos por WhatsApp y lo conversamos según tu situación. La mensualidad se paga mes a mes.'
  },
  {
    category: 'pricing',
    question: '¿Por qué es tan barato comparado con hacer un sitio desde cero?',
    answer: 'Porque los costos de desarrollo y mantenimiento se reparten entre todas las clínicas de la red. En vez de que cada veterinaria pague ₲10-15 millones por un desarrollo propio, compartimos una plataforma profesional y todos pagamos una fracción. Es el poder de la economía de escala.'
  },
];

function FAQItemComponent({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-center justify-between gap-4 text-left group"
      >
        <span className="text-white font-medium group-hover:text-[#2DCEA3] transition-colors">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#2DCEA3]' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-white/60 leading-relaxed pr-8">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[#2DCEA3] font-bold tracking-widest uppercase text-sm mb-3">
            Preguntas Frecuentes
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Todo lo que querés saber
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Respuestas honestas a las preguntas más comunes.
            Si no encontrás lo que buscás, escribinos.
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 rounded-2xl border border-white/10 px-6 md:px-8">
            {faqs.map((faq, idx) => (
              <FAQItemComponent
                key={idx}
                item={faq}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
            <HelpCircle className="w-8 h-8 text-[#2DCEA3]" />
            <div>
              <p className="text-white font-bold mb-1">¿Tenés otra pregunta?</p>
              <p className="text-white/50 text-sm mb-4">
                No te quedes con dudas. Escribinos y te respondemos rápido.
              </p>
              <a
                href="https://wa.me/595981324569?text=Hola!%20Tengo%20una%20pregunta%20sobre%20VetePy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full text-sm hover:shadow-lg hover:shadow-[#2DCEA3]/20 transition-all"
              >
                Preguntar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

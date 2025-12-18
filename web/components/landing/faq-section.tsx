'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '¿Cómo obtengo mi propia URL?',
    answer: 'Al unirte a VetePy, recibís una URL como tunombre.vetepy.com automáticamente. Si preferís usar tu propio dominio (ej: www.miveterinaria.com.py), podemos configurarlo sin costo adicional. Solo necesitás comprar el dominio y nosotros nos encargamos del resto.'
  },
  {
    question: '¿Puedo personalizar los colores y el diseño?',
    answer: 'Absolutamente. Cada clínica tiene su propia identidad visual. Configuramos tu logo, colores corporativos, imágenes y contenido. Aunque todas las clínicas comparten la misma plataforma, cada una se ve única y profesional.'
  },
  {
    question: '¿Qué pasa si necesito hacer cambios en mi sitio?',
    answer: 'Cambios de contenido (textos, precios, horarios) los podés hacer vos mismo o pedírnoslos por WhatsApp. Ajustes menores están incluidos. Para funcionalidades personalizadas o desarrollos específicos para tu clínica, te pasamos un presupuesto.'
  },
  {
    question: '¿Mis datos están seguros?',
    answer: 'Sí. Usamos tecnología de nivel bancario para proteger los datos. Cada clínica tiene sus datos completamente aislados de las demás. Hacemos backups diarios y todo el sitio usa HTTPS (certificado SSL). Cumplimos con estándares internacionales de seguridad.'
  },
  {
    question: '¿Puedo migrar datos de otro sistema?',
    answer: 'Sí, te ayudamos con la migración. Si tenés datos en Excel, otro software, o incluso en papel, trabajamos juntos para importar la información de tus clientes y mascotas a VetePy.'
  },
  {
    question: '¿Qué incluye el soporte técnico?',
    answer: 'Soporte por WhatsApp para dudas y problemas técnicos. Si algo no funciona, lo arreglamos. Si querés una funcionalidad nueva, la evaluamos: si beneficia a todos, la agregamos a la plataforma; si es algo específico para tu clínica, te cotizamos el desarrollo.'
  },
  {
    question: '¿Hay contrato de permanencia?',
    answer: 'No. Podés cancelar cuando quieras. Si por algún motivo VetePy no es para vos, cancelás y listo. Creemos que la mejor forma de retenerte es dándote un buen servicio, no obligándote con contratos.'
  },
  {
    question: '¿Cuánto tiempo tarda en estar listo mi sitio?',
    answer: 'Generalmente entre 3-7 días hábiles desde que nos enviás toda la información (logo, textos, fotos, servicios). Si ya tenés todo organizado, puede ser más rápido.'
  },
  {
    question: '¿Puedo ver una demo antes de contratar?',
    answer: '¡Por supuesto! Tenemos un sitio demo en vivo que podés explorar. También podemos hacer una llamada para mostrarte todo el sistema y responder tus preguntas.'
  },
  {
    question: '¿Necesito saber de tecnología para usar VetePy?',
    answer: 'Para nada. Si sabés usar WhatsApp y Facebook, podés usar VetePy. La plataforma está diseñada para ser simple. Y si tenés alguna duda, nuestro soporte está siempre disponible para ayudarte.'
  }
];

function FAQItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
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
          isOpen ? 'max-h-96 pb-5' : 'max-h-0'
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
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Preguntas Frecuentes
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Respondemos las dudas más comunes sobre VetePy.
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 rounded-2xl border border-white/10 px-6 md:px-8">
            {faqs.map((faq, idx) => (
              <FAQItem
                key={idx}
                item={faq}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>

        {/* More questions CTA */}
        <div className="text-center mt-10">
          <p className="text-white/50 mb-4">
            ¿Tenés otra pregunta?
          </p>
          <a
            href="https://wa.me/595981324569?text=Hola!%20Tengo%20una%20pregunta%20sobre%20VetePy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#2DCEA3] font-bold hover:underline"
          >
            <HelpCircle className="w-5 h-5" />
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

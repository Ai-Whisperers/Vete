import { getClinicData } from "@/lib/clinics";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Phone,
  Mail,
  ArrowLeft
} from "lucide-react";

interface Props {
  params: Promise<{ clinic: string }>;
}

// Client component for accordion
function FAQAccordion({ items }: { items: Array<{ question: string; answer: string }> }): React.ReactElement {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <details
          key={index}
          className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-gray-50 transition-colors">
            <span className="font-bold text-[var(--text-primary)] pr-4">
              {item.question}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
          </summary>
          <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export default async function FAQPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) {
    notFound();
  }

  const { config, faq } = data;

  // Default FAQs if none configured
  const defaultFAQs = [
    {
      question: "¿Cómo puedo agendar una cita?",
      answer: "Puedes agendar una cita de varias formas: a través de nuestro portal web haciendo clic en 'Agendar Cita', llamándonos por teléfono, o enviándonos un mensaje por WhatsApp. Te confirmaremos la disponibilidad y horario."
    },
    {
      question: "¿Qué vacunas necesita mi mascota?",
      answer: "El esquema de vacunación depende de la especie, edad y estilo de vida de tu mascota. En general, perros y gatos necesitan vacunas básicas como antirrábica y las polivalentes. Nuestros veterinarios te darán un plan personalizado en la primera consulta."
    },
    {
      question: "¿Atienden emergencias?",
      answer: "Sí, contamos con servicio de emergencias las 24 horas, los 7 días de la semana. En caso de emergencia, llámanos inmediatamente a nuestro número de guardia y te indicaremos cómo proceder."
    },
    {
      question: "¿Cuáles son las formas de pago?",
      answer: "Aceptamos efectivo, tarjetas de débito y crédito (Visa, Mastercard), transferencias bancarias. También ofrecemos opciones de financiamiento para procedimientos mayores."
    },
    {
      question: "¿Ofrecen servicio de peluquería?",
      answer: "Sí, contamos con servicio de peluquería canina y felina. Incluye baño, corte, limpieza de oídos, corte de uñas y más. Puedes agendar tu turno a través de nuestra plataforma o contactándonos directamente."
    },
    {
      question: "¿Cómo funciona la tienda online?",
      answer: "Nuestra tienda online te permite comprar alimentos, medicamentos y accesorios para tu mascota. Selecciona los productos, agrégalos al carrito y elige si prefieres retiro en clínica o delivery a domicilio."
    },
    {
      question: "¿Puedo ver el historial médico de mi mascota?",
      answer: "Sí, a través del Portal de Dueños puedes acceder al historial completo de vacunas, consultas, recetas y tratamientos de todas tus mascotas. Solo necesitas crear una cuenta con tu email."
    },
    {
      question: "¿Hacen cirugías?",
      answer: "Sí, realizamos cirugías de rutina como castraciones y esterilizaciones, así como cirugías más complejas. Todas nuestras intervenciones se realizan con equipos modernos y monitoreo constante."
    },
  ];

  // FaqData is FaqItem[] array, not an object with items property
  const faqItems = faq && faq.length > 0 ? faq.map(item => ({ question: item.question, answer: item.answer })) : defaultFAQs;
  const faqCategories = faq ? [...new Set(faq.map(item => item.category))] : [];

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Link
            href={`/${clinic}`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black">
              Preguntas Frecuentes
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            Encuentra respuestas a las dudas más comunes sobre nuestros servicios.
            Si no encuentras lo que buscas, no dudes en contactarnos.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Categories if available */}
          {faqCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {faqCategories.map((cat: string) => (
                <button
                  key={cat}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 hover:bg-[var(--primary)] hover:text-white transition-colors shadow-sm"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Items */}
          <FAQAccordion items={faqItems} />

          {/* Still Have Questions? */}
          <div className="mt-12 bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">
              ¿Aún tienes dudas?
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Nuestro equipo está listo para ayudarte. Contáctanos por el medio que prefieras.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {config.contact?.whatsapp_number && (
                <a
                  href={`https://wa.me/${config.contact.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              )}

              {config.contact?.phone_display && (
                <a
                  href={`tel:${config.contact.whatsapp_number}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Phone className="w-5 h-5" />
                  {config.contact.phone_display}
                </a>
              )}

              {config.contact?.email && (
                <a
                  href={`mailto:${config.contact.email}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

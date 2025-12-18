import { Metadata } from "next";
import { getClinicData, getAllClinics } from "@/lib/clinics";
import type { FaqItem } from "@/lib/clinics";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { FAQSection } from "@/components/faq/FAQSection";

interface Props {
  params: Promise<{ clinic: string }>;
}

// Generate static params for all clinics
export async function generateStaticParams() {
  const clinics = await getAllClinics();
  return clinics.map((clinic) => ({ clinic }));
}

// Generate metadata with FAQ structured data for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) {
    return {
      title: "Preguntas Frecuentes",
    };
  }

  const { config, faq } = data;
  const faqItems = faq && faq.length > 0 ? faq : getDefaultFAQs();

  // FAQ Schema.org structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return {
    title: `Preguntas Frecuentes | ${config.name}`,
    description: `Encuentra respuestas a las dudas más comunes sobre los servicios de ${config.name}. Consultas, horarios, formas de pago y más.`,
    openGraph: {
      title: `Preguntas Frecuentes | ${config.name}`,
      description: `Resuelve tus dudas sobre los servicios veterinarios de ${config.name}.`,
      type: "website",
    },
    other: {
      "script:ld+json": JSON.stringify(faqStructuredData),
    },
  };
}

// Default FAQs when none configured
function getDefaultFAQs(): FaqItem[] {
  return [
    {
      id: "default-1",
      category: "general",
      question: "¿Cómo puedo agendar una cita?",
      answer:
        "Puedes agendar una cita de varias formas: a través de nuestro portal web haciendo clic en 'Agendar Cita', llamándonos por teléfono, o enviándonos un mensaje por WhatsApp. Te confirmaremos la disponibilidad y horario.",
    },
    {
      id: "default-2",
      category: "vacunas",
      question: "¿Qué vacunas necesita mi mascota?",
      answer:
        "El esquema de vacunación depende de la especie, edad y estilo de vida de tu mascota. En general, perros y gatos necesitan vacunas básicas como antirrábica y las polivalentes. Nuestros veterinarios te darán un plan personalizado en la primera consulta.",
    },
    {
      id: "default-3",
      category: "urgencias",
      question: "¿Atienden emergencias?",
      answer:
        "Contamos con servicio de emergencias. En caso de emergencia, llámanos inmediatamente a nuestro número de contacto y te indicaremos cómo proceder.",
    },
    {
      id: "default-4",
      category: "pagos",
      question: "¿Cuáles son las formas de pago?",
      answer:
        "Aceptamos efectivo, tarjetas de débito y crédito (Visa, Mastercard), transferencias bancarias. También ofrecemos opciones de financiamiento para procedimientos mayores.",
    },
    {
      id: "default-5",
      category: "servicios",
      question: "¿Ofrecen servicio de peluquería?",
      answer:
        "Sí, contamos con servicio de peluquería canina y felina. Incluye baño, corte, limpieza de oídos, corte de uñas y más. Puedes agendar tu turno a través de nuestra plataforma o contactándonos directamente.",
    },
    {
      id: "default-6",
      category: "tienda",
      question: "¿Cómo funciona la tienda online?",
      answer:
        "Nuestra tienda online te permite comprar alimentos, medicamentos y accesorios para tu mascota. Selecciona los productos, agrégalos al carrito y elige si prefieres retiro en clínica o delivery a domicilio.",
    },
    {
      id: "default-7",
      category: "portal",
      question: "¿Puedo ver el historial médico de mi mascota?",
      answer:
        "Sí, a través del Portal de Dueños puedes acceder al historial completo de vacunas, consultas, recetas y tratamientos de todas tus mascotas. Solo necesitas crear una cuenta con tu email.",
    },
    {
      id: "default-8",
      category: "cirugia",
      question: "¿Hacen cirugías?",
      answer:
        "Sí, realizamos cirugías de rutina como castraciones y esterilizaciones, así como cirugías más complejas. Todas nuestras intervenciones se realizan con equipos modernos y monitoreo constante.",
    },
  ];
}

export default async function FAQPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) {
    notFound();
  }

  const { config, faq } = data;

  // Use clinic FAQs or defaults
  const faqItems: FaqItem[] = faq && faq.length > 0 ? faq : getDefaultFAQs();

  // Extract unique categories
  const categories = [...new Set(faqItems.map((item) => item.category))].filter(Boolean);

  // Format phone number for tel: link (add + prefix for international format)
  const phoneNumber = config.contact?.whatsapp_number
    ? `+${config.contact.whatsapp_number}`
    : null;

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
              <HelpCircle className="w-7 h-7" aria-hidden="true" />
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
          {/* Interactive FAQ Section */}
          <FAQSection items={faqItems} categories={categories} />

          {/* Still Have Questions? */}
          <div className="mt-12 bg-[var(--bg-default)] rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">
              ¿Aún tienes dudas?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Nuestro equipo está listo para ayudarte. Contáctanos por el medio que prefieras.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {config.contact?.whatsapp_number && (
                <a
                  href={`https://wa.me/${config.contact.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--status-success)] text-white font-bold rounded-xl hover:bg-[var(--status-success-dark)] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  WhatsApp
                </a>
              )}

              {phoneNumber && config.contact?.phone_display && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  {config.contact.phone_display}
                </a>
              )}

              {config.contact?.email && (
                <a
                  href={`mailto:${config.contact.email}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--border)] text-[var(--text-primary)] font-bold rounded-xl hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  Email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Schema.org JSON-LD (for search engines) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

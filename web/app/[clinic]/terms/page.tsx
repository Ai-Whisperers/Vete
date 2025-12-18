import { getClinicData } from "@/lib/clinics";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Calendar, ShieldCheck, Scale, Clock } from "lucide-react";

interface Props {
  params: Promise<{ clinic: string }>;
}

export default async function TermsPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) {
    notFound();
  }

  const { config } = data;
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      icon: FileText,
      title: "1. Aceptación de los Términos",
      content: `Al utilizar los servicios de ${config.name}, ya sea a través de nuestra clínica física o plataforma digital, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, te pedimos que no utilices nuestros servicios.`
    },
    {
      icon: ShieldCheck,
      title: "2. Servicios Veterinarios",
      content: `Proporcionamos servicios veterinarios profesionales que incluyen consultas, vacunaciones, cirugías, diagnósticos y tratamientos. Todos nuestros servicios son realizados por profesionales veterinarios matriculados. Los resultados de tratamientos pueden variar según cada caso individual.`
    },
    {
      icon: Calendar,
      title: "3. Citas y Cancelaciones",
      content: `Las citas deben ser programadas con anticipación a través de nuestra plataforma, teléfono o WhatsApp. Solicitamos un aviso de al menos 24 horas para cancelaciones. Las cancelaciones tardías o ausencias repetidas pueden resultar en restricciones para futuras reservas.`
    },
    {
      icon: CreditCard,
      title: "4. Pagos y Facturación",
      content: `Los pagos por servicios deben realizarse al momento de la consulta o según el acuerdo establecido. Aceptamos efectivo, tarjetas de débito/crédito y transferencias bancarias. Los precios publicados pueden cambiar sin previo aviso. Las cirugías y procedimientos especiales pueden requerir un depósito previo.`
    },
    {
      icon: AlertTriangle,
      title: "5. Emergencias",
      content: `Nuestro servicio de emergencias está disponible las 24 horas. En situaciones de emergencia, podemos requerir autorización verbal para proceder con tratamientos urgentes. Los servicios de emergencia tienen tarifas diferenciadas según el horario.`
    },
    {
      icon: Scale,
      title: "6. Responsabilidades del Cliente",
      content: `Como cliente, te comprometes a: proporcionar información veraz sobre la salud de tu mascota, seguir las indicaciones médicas proporcionadas, informar sobre cualquier reacción adversa a tratamientos, mantener actualizada tu información de contacto, y tratar con respeto a nuestro personal.`
    },
    {
      icon: Clock,
      title: "7. Historial Médico",
      content: `Mantenemos un registro digital del historial médico de tu mascota al que puedes acceder a través del Portal de Dueños. Este historial es confidencial y solo se comparte con tu autorización expresa o cuando la ley lo requiera. Conservamos los registros por un mínimo de 5 años.`
    }
  ];

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
              <FileText className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black">
              Términos y Condiciones
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl">
            Estos términos regulan el uso de nuestros servicios veterinarios y plataforma digital.
            Por favor, léelos cuidadosamente.
          </p>
          <p className="text-white/60 text-sm mt-4">
            Última actualización: {currentYear}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Sections */}
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {section.title}
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Limitation of Liability */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-800 mb-2">
                  8. Limitación de Responsabilidad
                </h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Aunque nos esforzamos por proporcionar el mejor cuidado posible, la medicina
                  veterinaria tiene limitaciones inherentes. No garantizamos resultados específicos
                  de tratamientos. Nuestra responsabilidad se limita al valor de los servicios
                  prestados. No somos responsables por complicaciones derivadas del incumplimiento
                  de las indicaciones médicas por parte del propietario.
                </p>
              </div>
            </div>
          </div>

          {/* Modifications */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-3">
              9. Modificaciones a los Términos
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios entrarán en vigencia inmediatamente después de su publicación
              en nuestra plataforma. El uso continuado de nuestros servicios después de
              cualquier modificación constituye la aceptación de los nuevos términos.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-[var(--text-primary)] mb-3">
              10. Contacto y Jurisdicción
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Para consultas sobre estos términos, contáctanos a través de:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> {config.contact?.email}</p>
              <p><strong>Teléfono:</strong> {config.contact?.phone_display}</p>
              <p><strong>Dirección:</strong> {config.contact?.address}</p>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Estos términos se rigen por las leyes de la República del Paraguay.
              Cualquier disputa será resuelta en los tribunales competentes de la
              ciudad de Asunción.
            </p>
          </div>

          {/* Agreement */}
          <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--accent)]/5 rounded-2xl p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-[var(--primary)] mx-auto mb-4" />
            <p className="text-gray-600">
              Al utilizar nuestros servicios, confirmas que has leído, entendido y
              aceptado estos términos y condiciones.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

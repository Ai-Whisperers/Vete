'use client';

import Link from 'next/link';
import {
  Search, UserPlus, Smartphone, Calendar, Heart,
  PawPrint, Shield, Bell, QrCode, FileText, Star,
  ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Encontra una Clinica',
    description: 'Busca en nuestro mapa la veterinaria VetePy mas cercana a vos. Todas tienen el mismo nivel de tecnologia.',
    color: '#2DCEA3'
  },
  {
    number: '02',
    icon: UserPlus,
    title: 'Registrate Gratis',
    description: 'Crea tu cuenta en la clinica que elegiste. Solo necesitas tu email y un password. Tarda menos de 1 minuto.',
    color: '#00C9FF'
  },
  {
    number: '03',
    icon: PawPrint,
    title: 'Agrega tus Mascotas',
    description: 'Registra a tus mascotas con sus datos basicos. La clinica completara el historial medico en cada visita.',
    color: '#5C6BFF'
  },
  {
    number: '04',
    icon: Sparkles,
    title: 'Disfruta los Beneficios',
    description: 'Agenda citas online, recibe recordatorios, accede al historial digital y mucho mas. Todo desde tu celular.',
    color: '#2DCEA3'
  }
];

const benefits = [
  {
    icon: Smartphone,
    title: 'Todo en tu Celular',
    description: 'Accede al historial medico, vacunas y recetas de tus mascotas desde cualquier lugar, 24/7.'
  },
  {
    icon: Calendar,
    title: 'Citas Online',
    description: 'Agenda turnos sin llamar. Elige fecha, hora y veterinario desde la comodidad de tu casa.'
  },
  {
    icon: Bell,
    title: 'Recordatorios',
    description: 'Te avisamos cuando toca vacunar, desparasitar o hacer el control anual. Nunca mas te olvidas.'
  },
  {
    icon: QrCode,
    title: 'Tag QR Gratis',
    description: 'Tu mascota recibe un codigo QR unico. Si se pierde, quien la encuentre puede contactarte al instante.'
  },
  {
    icon: FileText,
    title: 'Documentos Digitales',
    description: 'Recetas, facturas y certificados siempre disponibles. Descargalos o compartelos cuando los necesites.'
  },
  {
    icon: Star,
    title: 'Puntos de Lealtad',
    description: 'Acumula puntos en cada visita y compra. Canjealos por descuentos en servicios y productos.'
  }
];

const faqs = [
  {
    question: '¿Cuanto cuesta para mi como dueno?',
    answer: 'Nada. El servicio es 100% gratuito para los duenos de mascotas. Solo la clinica paga por usar VetePy.'
  },
  {
    question: '¿Puedo tener mascotas en varias clinicas?',
    answer: 'Si. Puedes registrar diferentes mascotas en diferentes clinicas VetePy. Cada una tendra su propio historial.'
  },
  {
    question: '¿Que pasa si mi veterinaria no usa VetePy?',
    answer: 'Puedes recomendarle a tu veterinaria que se una a la red. Contactanos y les explicamos los beneficios.'
  }
];

export function OwnerJourney() {
  return (
    <section id="para-duenos" className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5C6BFF]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#2DCEA3]/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C6BFF]/10 border border-[#5C6BFF]/20 mb-6">
            <PawPrint className="w-4 h-4 text-[#5C6BFF]" />
            <span className="text-[#5C6BFF] text-sm font-medium">Para Duenos de Mascotas</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Tu mascota merece lo mejor
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Como dueno, tenes acceso gratuito a herramientas digitales que hacen mas facil
            cuidar la salud de tu mascota. Asi funciona:
          </p>
        </div>

        {/* Journey Steps */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-40px)] h-0.5">
                    <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent" />
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  </div>
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <step.icon className="w-10 h-10" style={{ color: step.color }} />
                  </div>

                  {/* Step number */}
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                    style={{ backgroundColor: step.color, color: '#0F172A' }}
                  >
                    Paso {step.number}
                  </span>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-20">
          <h3 className="text-center text-2xl font-bold text-white mb-8">
            Todo esto es gratis para vos
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#5C6BFF]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#5C6BFF]/10 flex items-center justify-center mb-3 group-hover:bg-[#5C6BFF]/20 transition-colors">
                  <benefit.icon className="w-5 h-5 text-[#5C6BFF]" />
                </div>
                <h4 className="text-white font-bold mb-1">{benefit.title}</h4>
                <p className="text-white/50 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile App Preview */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Siempre a mano, en tu celular
              </h3>
              <p className="text-white/60 mb-6">
                El portal de VetePy funciona perfecto desde el navegador de tu celular.
                No necesitas descargar ninguna app. Guarda el link en tu pantalla de inicio
                y accede con un solo toque.
              </p>
              <ul className="space-y-3">
                {[
                  'Ve el historial medico completo',
                  'Descarga el carnet de vacunas en PDF',
                  'Recibe notificaciones de recordatorios',
                  'Chatea directamente con la clinica'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-white/70">
                    <CheckCircle2 className="w-5 h-5 text-[#2DCEA3] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              {/* Phone mockup */}
              <div className="relative mx-auto w-[240px] h-[480px] bg-[#1a2744] rounded-[3rem] border-4 border-white/10 shadow-2xl overflow-hidden">
                {/* Screen content */}
                <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-b from-[#2DCEA3]/20 to-[#5C6BFF]/20 overflow-hidden">
                  {/* Status bar */}
                  <div className="h-8 bg-black/20 flex items-center justify-center">
                    <div className="w-20 h-4 bg-black/30 rounded-full" />
                  </div>

                  {/* Content preview */}
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#2DCEA3]/30 flex items-center justify-center">
                        <PawPrint className="w-6 h-6 text-[#2DCEA3]" />
                      </div>
                      <div>
                        <div className="w-20 h-3 bg-white/30 rounded" />
                        <div className="w-14 h-2 bg-white/20 rounded mt-1" />
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[#5C6BFF]" />
                          <div className="w-16 h-2 bg-white/30 rounded" />
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded" />
                      </div>
                      <div className="p-3 rounded-lg bg-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="w-4 h-4 text-[#2DCEA3]" />
                          <div className="w-20 h-2 bg-white/30 rounded" />
                        </div>
                        <div className="w-3/4 h-2 bg-white/20 rounded" />
                      </div>
                      <div className="p-3 rounded-lg bg-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-[#00C9FF]" />
                          <div className="w-14 h-2 bg-white/30 rounded" />
                        </div>
                        <div className="w-2/3 h-2 bg-white/20 rounded" />
                      </div>
                    </div>

                    {/* Bottom nav */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-around p-2 rounded-full bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div className="w-8 h-8 rounded-full bg-[#2DCEA3]/30" />
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#5C6BFF]/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#2DCEA3]/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>

        {/* Mini FAQ */}
        <div className="max-w-3xl mx-auto mb-12">
          <h3 className="text-center text-xl font-bold text-white mb-6">
            Preguntas frecuentes de duenos
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-white font-bold mb-2">{faq.question}</h4>
                <p className="text-white/50 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/50 mb-4">
            ¿Listo para empezar?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#mapa"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5C6BFF] to-[#00C9FF] text-white font-bold rounded-full hover:shadow-lg hover:shadow-[#5C6BFF]/20 transition-all"
            >
              <Search className="w-5 h-5" />
              Buscar Clinica Cercana
            </a>
            <a
              href="https://wa.me/595981324569?text=Hola!%20Soy%20dueno%20de%20mascota%20y%20quiero%20saber%20mas%20sobre%20VetePy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all"
            >
              Tengo una Pregunta
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, MessageCircle, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#2DCEA3]/20 via-[#00C9FF]/10 to-[#5C6BFF]/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-[#2DCEA3]" />
            <span className="text-white/80 text-sm font-medium">
              Empezá hoy, está listo en días
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
            ¿Listo para llevar tu veterinaria al{' '}
            <span className="bg-gradient-to-r from-[#2DCEA3] via-[#00C9FF] to-[#5C6BFF] bg-clip-text text-transparent">
              mundo digital
            </span>
            ?
          </h2>

          {/* Subtext */}
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            Únete a la red de veterinarias más moderna de Paraguay.
            Sin riesgos, sin contratos largos, sin complicaciones técnicas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://wa.me/595981324569?text=Hola!%20Quiero%20unirme%20a%20VetePy"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full shadow-xl shadow-[#2DCEA3]/20 hover:shadow-2xl hover:shadow-[#2DCEA3]/30 transition-all hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5" />
              Contactar por WhatsApp
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              href="/adris"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 hover:border-white/30 transition-all hover:-translate-y-1"
            >
              <Play className="w-5 h-5" />
              Ver Demo en Vivo
            </Link>
          </div>

          {/* Trust elements */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/40 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DCEA3]" />
              Sin contratos largos
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DCEA3]" />
              Cancelás cuando quieras
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DCEA3]" />
              Listo en días
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

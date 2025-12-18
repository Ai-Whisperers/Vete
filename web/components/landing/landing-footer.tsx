import Link from 'next/link';
import { Stethoscope, Mail, Phone, MapPin } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DCEA3] to-[#5C6BFF] flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Vete<span className="text-[#2DCEA3]">Py</span>
              </span>
            </Link>
            <p className="text-white/60 max-w-md mb-6 leading-relaxed">
              La red veterinaria digital de Paraguay. Profesionalizamos la presencia online
              de clínicas veterinarias con tecnología de primer mundo a precios accesibles.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:contacto@vetepy.com" className="flex items-center gap-2 text-white/60 hover:text-[#2DCEA3] transition-colors">
                <Mail className="w-4 h-4" />
                contacto@vetepy.com
              </a>
              <a href="tel:+595981324569" className="flex items-center gap-2 text-white/60 hover:text-[#2DCEA3] transition-colors">
                <Phone className="w-4 h-4" />
                +595 981 324 569
              </a>
              <span className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" />
                Asunción, Paraguay
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li>
                <a href="#caracteristicas" className="text-white/60 hover:text-[#2DCEA3] transition-colors text-sm">
                  Características
                </a>
              </li>
              <li>
                <a href="#precios" className="text-white/60 hover:text-[#2DCEA3] transition-colors text-sm">
                  Precios
                </a>
              </li>
              <li>
                <a href="#faq" className="text-white/60 hover:text-[#2DCEA3] transition-colors text-sm">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <Link href="/adris" className="text-white/60 hover:text-[#2DCEA3] transition-colors text-sm">
                  Ver Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-[#2DCEA3] transition-colors text-sm">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/60 hover:text-[#2DCEA3] transition-colors text-sm">
                  Términos de Servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} VetePy. Todos los derechos reservados.
          </p>
          <p className="text-white/40 text-sm">
            Hecho con amor en Paraguay
          </p>
        </div>
      </div>
    </footer>
  );
}

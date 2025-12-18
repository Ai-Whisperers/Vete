import Link from 'next/link';
import { Stethoscope, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0D1424] border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#2DCEA3] to-[#5C6BFF] flex items-center justify-center">
                <Stethoscope className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-white">
                Vete<span className="text-[#2DCEA3]">Py</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm max-w-xs mb-5 leading-relaxed">
              La red veterinaria digital de Paraguay. Tecnologia de primer mundo a precios accesibles.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="https://wa.me/595981324569"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-[#2DCEA3] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a href="mailto:contacto@vetepy.com" className="flex items-center gap-2 text-white/60 hover:text-[#2DCEA3] transition-colors">
                <Mail className="w-4 h-4" />
                contacto@vetepy.com
              </a>
              <a href="tel:+595981324569" className="flex items-center gap-2 text-white/60 hover:text-[#2DCEA3] transition-colors">
                <Phone className="w-4 h-4" />
                +595 981 324 569
              </a>
              <span className="flex items-center gap-2 text-white/40">
                <MapPin className="w-4 h-4" />
                Asuncion, Paraguay
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Plataforma</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#como-funciona" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#caracteristicas" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  Caracteristicas
                </a>
              </li>
              <li>
                <a href="#precios" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  Precios
                </a>
              </li>
              <li>
                <a href="#prueba-gratis" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  Prueba Gratis
                </a>
              </li>
              <li>
                <a href="#faq" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/adris" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  Ver Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/50 hover:text-[#2DCEA3] transition-colors text-sm">
                  Terminos
                </Link>
              </li>
            </ul>

            {/* Social - could add more later */}
            <h4 className="text-white font-bold mb-3 mt-6 text-sm">Redes</h4>
            <div className="flex gap-2">
              <a
                href="https://wa.me/595981324569"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#2DCEA3]/20 flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-white/60 hover:text-[#2DCEA3]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/30 text-xs">
            © {currentYear} VetePy. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-xs">
            Hecho con ❤️ en Paraguay
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link'
import { Stethoscope, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-[#0D1424]">
      <div className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2DCEA3] to-[#5C6BFF] md:h-10 md:w-10">
                <Stethoscope className="h-4 w-4 text-white md:h-5 md:w-5" />
              </div>
              <span className="text-lg font-bold text-white md:text-xl">
                Vete<span className="text-[#2DCEA3]">Py</span>
              </span>
            </Link>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/50">
              La red veterinaria digital de Paraguay. Tecnologia de primer mundo a precios
              accesibles.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="https://wa.me/595981324569"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 transition-colors hover:text-[#2DCEA3]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="mailto:contacto@vetepy.com"
                className="flex items-center gap-2 text-white/60 transition-colors hover:text-[#2DCEA3]"
              >
                <Mail className="h-4 w-4" />
                contacto@vetepy.com
              </a>
              <a
                href="tel:+595981324569"
                className="flex items-center gap-2 text-white/60 transition-colors hover:text-[#2DCEA3]"
              >
                <Phone className="h-4 w-4" />
                +595 981 324 569
              </a>
              <span className="flex items-center gap-2 text-white/40">
                <MapPin className="h-4 w-4" />
                Asuncion, Paraguay
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">Plataforma</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#como-funciona"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  Como funciona
                </a>
              </li>
              <li>
                <a
                  href="#caracteristicas"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  Caracteristicas
                </a>
              </li>
              <li>
                <a
                  href="#precios"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  Precios
                </a>
              </li>
              <li>
                <a
                  href="#prueba-gratis"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  Prueba Gratis
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  FAQ
                </a>
              </li>
              <li>
                <Link
                  href="/adris"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  Ver Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">Legal</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-white/50 transition-colors hover:text-[#2DCEA3]"
                >
                  Terminos
                </Link>
              </li>
            </ul>

            {/* Social - could add more later */}
            <h4 className="mb-3 mt-6 text-sm font-bold text-white">Redes</h4>
            <div className="flex gap-2">
              <a
                href="https://wa.me/595981324569"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors hover:bg-[#2DCEA3]/20"
              >
                <MessageCircle className="h-4 w-4 text-white/60 hover:text-[#2DCEA3]" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/30">
            © {currentYear} VetePy. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/30">Hecho con ❤️ en Paraguay</p>
        </div>
      </div>
    </footer>
  )
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Stethoscope } from 'lucide-react';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DCEA3] to-[#5C6BFF] flex items-center justify-center shadow-lg shadow-[#2DCEA3]/20 group-hover:shadow-[#2DCEA3]/40 transition-shadow">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Vete<span className="text-[#2DCEA3]">Py</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#caracteristicas" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Características
            </a>
            <a href="#precios" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              Precios
            </a>
            <a href="#faq" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
              FAQ
            </a>
            <Link
              href="/adris"
              className="text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              Ver Demo
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://wa.me/595981324569?text=Hola!%20Me%20interesa%20VetePy%20para%20mi%20cl%C3%ADnica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full hover:shadow-lg hover:shadow-[#2DCEA3]/30 transition-all hover:-translate-y-0.5"
            >
              Contactar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <a
                href="#caracteristicas"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Características
              </a>
              <a
                href="#precios"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Precios
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                FAQ
              </a>
              <Link
                href="/adris"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/70 hover:text-white transition-colors font-medium"
              >
                Ver Demo
              </Link>
              <a
                href="https://wa.me/595981324569?text=Hola!%20Me%20interesa%20VetePy%20para%20mi%20cl%C3%ADnica"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full mt-2"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

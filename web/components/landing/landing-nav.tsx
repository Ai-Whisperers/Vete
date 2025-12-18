'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Stethoscope, ChevronDown, MapPin, Building2, PawPrint, LogIn } from 'lucide-react';

const navLinks = [
  { href: '#caracteristicas', label: 'Caracteristicas' },
  { href: '#clinicas', label: 'Clinicas' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
];

const clinicLinks = [
  { href: '/adris', label: 'Veterinaria Adris', city: 'Asuncion' },
  { href: '/petlife', label: 'PetLife Center', city: 'Mariano R. Alonso' },
];

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clinicsDropdownOpen, setClinicsDropdownOpen] = useState(false);

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
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}

            {/* Clinics Dropdown */}
            <div className="relative">
              <button
                onClick={() => setClinicsDropdownOpen(!clinicsDropdownOpen)}
                onBlur={() => setTimeout(() => setClinicsDropdownOpen(false), 200)}
                className="flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <MapPin className="w-4 h-4" />
                Red
                <ChevronDown className={`w-4 h-4 transition-transform ${clinicsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {clinicsDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 py-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-xl">
                  <a
                    href="#mapa"
                    className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#2DCEA3]" />
                    <div>
                      <p className="text-sm font-medium">Ver Mapa</p>
                      <p className="text-xs text-white/40">Encontra clinicas cerca</p>
                    </div>
                  </a>
                  <div className="my-2 border-t border-white/10" />
                  {clinicLinks.map((clinic) => (
                    <Link
                      key={clinic.href}
                      href={clinic.href}
                      className="flex items-center gap-3 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">{clinic.label}</p>
                        <p className="text-xs text-white/40">{clinic.city}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Pet Owner Link */}
            <a
              href="#para-duenos"
              className="flex items-center gap-1 text-[#5C6BFF] hover:text-[#7C8BFF] transition-colors text-sm font-medium"
            >
              <PawPrint className="w-4 h-4" />
              Duenos
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/adris/portal/login"
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              Ingresar
            </Link>
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
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}

              {/* Network section */}
              <div className="px-4 py-2">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Red de Clinicas</p>
                <a
                  href="#mapa"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-[#2DCEA3] font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  Ver Mapa
                </a>
                {clinicLinks.map((clinic) => (
                  <Link
                    key={clinic.href}
                    href={clinic.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-white/70 hover:text-white"
                  >
                    <Building2 className="w-4 h-4" />
                    {clinic.label}
                  </Link>
                ))}
              </div>

              {/* Pet Owners */}
              <a
                href="#para-duenos"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-[#5C6BFF] hover:text-[#7C8BFF] hover:bg-white/5 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <PawPrint className="w-4 h-4" />
                Para Duenos de Mascotas
              </a>

              {/* Login */}
              <Link
                href="/adris/portal/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Ingresar al Portal
              </Link>

              {/* CTA */}
              <div className="px-4 pt-4 mt-2 border-t border-white/10">
                <a
                  href="https://wa.me/595981324569?text=Hola!%20Me%20interesa%20VetePy%20para%20mi%20cl%C3%ADnica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] text-[#0F172A] font-bold rounded-full"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

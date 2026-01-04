'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Stethoscope, ChevronDown, MapPin, Building2, PawPrint, LogIn } from 'lucide-react'

const navLinks = [
  { href: '#caracteristicas', label: 'Caracteristicas' },
  { href: '#clinicas', label: 'Clinicas' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
]

const clinicLinks = [
  { href: '/adris', label: 'Veterinaria Adris', city: 'Asuncion' },
  { href: '/petlife', label: 'PetLife Center', city: 'Mariano R. Alonso' },
]

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [clinicsDropdownOpen, setClinicsDropdownOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2DCEA3] to-[#5C6BFF] shadow-lg shadow-[#2DCEA3]/20 transition-shadow group-hover:shadow-[#2DCEA3]/40">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Vete<span className="text-[#2DCEA3]">Py</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}

            {/* Clinics Dropdown */}
            <div className="relative">
              <button
                onClick={() => setClinicsDropdownOpen(!clinicsDropdownOpen)}
                onBlur={() => setTimeout(() => setClinicsDropdownOpen(false), 200)}
                className="flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                <MapPin className="h-4 w-4" />
                Red
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${clinicsDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {clinicsDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[#0F172A] py-2 shadow-xl">
                  <a
                    href="#mapa"
                    className="flex items-center gap-3 px-4 py-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <MapPin className="h-4 w-4 text-[#2DCEA3]" />
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
                      className="flex items-center gap-3 px-4 py-2 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <Building2 className="h-4 w-4" />
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
              className="flex items-center gap-1 text-sm font-medium text-[#5C6BFF] transition-colors hover:text-[#7C8BFF]"
            >
              <PawPrint className="h-4 w-4" />
              Duenos
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/adris/portal/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <LogIn className="h-4 w-4" />
              Ingresar
            </Link>
            <a
              href="https://wa.me/595981324569?text=Hola!%20Me%20interesa%20VetePy%20para%20mi%20cl%C3%ADnica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] px-5 py-2.5 font-bold text-[#0F172A] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2DCEA3]/30"
            >
              Contactar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/70 transition-colors hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-4 py-2 font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}

              {/* Network section */}
              <div className="px-4 py-2">
                <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
                  Red de Clinicas
                </p>
                <a
                  href="#mapa"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 font-medium text-[#2DCEA3]"
                >
                  <MapPin className="h-4 w-4" />
                  Ver Mapa
                </a>
                {clinicLinks.map((clinic) => (
                  <Link
                    key={clinic.href}
                    href={clinic.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-white/70 hover:text-white"
                  >
                    <Building2 className="h-4 w-4" />
                    {clinic.label}
                  </Link>
                ))}
              </div>

              {/* Pet Owners */}
              <a
                href="#para-duenos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-[#5C6BFF] transition-colors hover:bg-white/5 hover:text-[#7C8BFF]"
              >
                <PawPrint className="h-4 w-4" />
                Para Duenos de Mascotas
              </a>

              {/* Login */}
              <Link
                href="/adris/portal/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Ingresar al Portal
              </Link>

              {/* CTA */}
              <div className="mt-2 border-t border-white/10 px-4 pt-4">
                <a
                  href="https://wa.me/595981324569?text=Hola!%20Me%20interesa%20VetePy%20para%20mi%20cl%C3%ADnica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2DCEA3] to-[#00C9FF] px-5 py-3 font-bold text-[#0F172A]"
                >
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

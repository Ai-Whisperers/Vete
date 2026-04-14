'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Shield, 
  Waves, 
  Trees, 
  MapPin, 
  Phone, 
  Mail, 
  Menu, 
  X,
  Home,
  Flame,
  CircleDot,
  Smile
} from 'lucide-react'

interface ArasyHomeProps {
  clinicData?: any
}

export function ArasyHome({ clinicData }: ArasyHomeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const navItems = [
    { label: 'Inicio', href: '#' },
    { label: 'Viviendas', href: '#viviendas' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Ubicación', href: '#ubicacion' },
    { label: 'Contacto', href: '#contacto' },
  ]

  const properties = [
    {
      name: 'Casa 2 Dormitorios',
      rooms: 2,
      bathrooms: 2,
      area: 61,
      land: 119,
      price: 'Gs. 295.000.000',
      features: ['Sala/Comedor integrados', 'Patio con parrilla', '2 Estacionamientos']
    },
    {
      name: 'Casa 3 Dormitorios',
      rooms: 3,
      bathrooms: 2,
      area: 80,
      land: 144,
      price: 'Gs. 310.000.000',
      features: ['1 Suite', 'Sala/Comedor', 'Patio con parrilla', '2 Estacionamientos']
    }
  ]

  const amenities = [
    { icon: Waves, title: 'Piscina', desc: 'Área de piscina con solárium' },
    { icon: Flame, title: 'Quinchos', desc: 'Quinchos con parrilla' },
    { icon: CircleDot, title: 'Cancha', desc: 'Cancha multiuso' },
    { icon: Smile, title: 'Parque', desc: 'Juegos para niños' },
    { icon: Shield, title: 'Seguridad', desc: 'Control de acceso 24hs' },
    { icon: Trees, title: 'Naturaleza', desc: 'Jardines y senderos' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Home className="h-8 w-8 text-[#2D5A27]" />
              <span className="text-xl font-bold text-[#1A1A1A] font-[Georgia]">
                Barrio Arasy
              </span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="text-sm text-[#4A4A4A] hover:text-[#2D5A27] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            {navItems.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-[#4A4A4A] hover:text-[#2D5A27]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 bg-gradient-to-br from-[#2D5A27] to-[#1E3D1A]">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold font-[Georgia] mb-4">
            Barrio Cerrado Arasy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Seguridad, Naturaleza y Calidad de Vida en el corazón de Central
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#viviendas"
              className="bg-[#D4AF37] text-[#1A1A1A] px-8 py-3 rounded-full font-semibold hover:bg-[#C9A136] transition-colors"
            >
              Ver Viviendas
            </Link>
            <Link 
              href="#contacto"
              className="border border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-[#f0f5eb]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2D5A27]/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-[#2D5A27]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Seguridad 24/7</h3>
              <p className="text-[#4A4A4A]">
                Control de acceso y vigilancia perimetral las 24 horas
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-[#f0f5eb]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2D5A27]/10 flex items-center justify-center">
                <Waves className="h-8 w-8 text-[#2D5A27]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Piscina y Amenities</h3>
              <p className="text-[#4A4A4A]">
                Áreas comunes pensadas para tu familia
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-[#f0f5eb]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2D5A27]/10 flex items-center justify-center">
                <Trees className="h-8 w-8 text-[#2D5A27]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">Entorno Natural</h3>
              <p className="text-[#4A4A4A]">
                Amplios espacios verdes y senderos tranquilos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section id="viviendas" className="py-20 bg-[#FAFAF5]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] font-[Georgia] mb-4">
              Nuestras Viviendas
            </h2>
            <p className="text-lg text-[#4A4A4A]">
              Diseños modernos con espacios pensados para tu familia
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {properties.map((property, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                <div className="h-48 bg-[#2D5A27]/10 flex items-center justify-center">
                  <Home className="h-16 w-16 text-[#2D5A27]/30" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                    {property.name}
                  </h3>
                  <div className="flex gap-4 text-sm text-[#4A4A4A] mb-4">
                    <span>{property.rooms} dorm.</span>
                    <span>{property.bathrooms} baños</span>
                    <span>{property.area}m²</span>
                    <span>{property.land}m² terreno</span>
                  </div>
                  <ul className="space-y-1 mb-4">
                    {property.features.map((feature, i) => (
                      <li key={i} className="text-sm text-[#4A4A4A] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#2D5A27]">
                      {property.price}
                    </span>
                    <Link
                      href="#contacto"
                      className="text-[#2D5A27] hover:underline text-sm font-medium"
                    >
                      Consultar →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section id="amenities" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] font-[Georgia] mb-4">
              Amenities
            </h2>
            <p className="text-lg text-[#4A4A4A]">
              Todo lo que necesitás para vivir bien
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {amenities.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-[#FAFAF5]">
                <div className="w-12 h-12 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-[#2D5A27]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{item.title}</h3>
                  <p className="text-sm text-[#4A4A4A]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="ubicacion" className="py-20 bg-[#FAFAF5]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] font-[Georgia] mb-4">
              Ubicación
            </h2>
            <p className="text-lg text-[#4A4A4A]">
              Convenientemente ubicado en el camino Luque - Areguá
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-[#2D5A27] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">Dirección</h3>
                  <p className="text-[#4A4A4A]">Camino Luque - Areguá, Central, Paraguay</p>
                </div>
              </div>
              <ul className="space-y-3 text-[#4A4A4A]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
                  A 10 minutos del centro de Luque
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
                  Cerca de supermercados y farmacias
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]" />
                  Fácil acceso a Asunción
                </li>
              </ul>
            </div>
            <div className="h-64 md:h-96 bg-[#2D5A27]/10 rounded-2xl flex items-center justify-center">
              <MapPin className="h-16 w-16 text-[#2D5A27]/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-20 bg-[#2D5A27]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold font-[Georgia] mb-4">
            Contáctanos
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Estamos para ayudarte a encontrar tu nuevo hogar
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center justify-center gap-3">
              <Phone className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm text-white/70">Teléfono</p>
                <p className="font-medium">+595 981 123 456</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Mail className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm text-white/70">Email</p>
                <p className="font-medium">ventas@barrioarasy.com.py</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <MapPin className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm text-white/70">Dirección</p>
                <p className="font-medium">Luque - Areguá</p>
              </div>
            </div>
          </div>

          <a 
            href="https://wa.me/595981123456"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1A1A1A] px-8 py-3 rounded-full font-semibold hover:bg-[#C9A136] transition-colors"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.173-.298.297-.497.124-.183.073-.366-.037-.512-.149-.174-.396-.596-.595-1.04v-.01c-.198-.496-.4-1.01-.594-1.484-.097-.248-.025-.373.073-.491.149-.149.396-.596.546-.794.149-.198.174-.298.298-.497l.04-.174c.124-.183.025-.348-.025-.497-.074-.223-.595-.79-.595-1.4v-.01c0-.596.745-1.163 1.04-1.37.149-.104.348-.149.497-.223l.173-.04c.248-.05.397-.05.521.074.173.149.596.596.848.794.149.198.248.348.37.521.075.124.124.248.198.348.074.099.124.173.198.273.173.198.546 1.04 1.04 1.795.892 1.34 1.04 1.825 1.04 1.825.124.173.372.496.595.795.124.198.173.348.174.447v.01c-.025.174-.124.348-.248.497-.173.198-.397.595-.595 1.04l-.596 1.04-.596.596c-1.04.695-2.09.695-2.09.695H12.5c-.596 0-1.04-.025-1.318.075-.248.099-.596.248-.848.521-1.04 1.14-1.04 2.09 0 3.248 1.14 1.14 2.388 1.686 3.248 1.686.894 0 1.686-.397 2.388-1.14.173-.198.347-.397.521-.596.174-.198.347-.397.521-.596.198-.198.347-.397.595-.646l.596-.596c.397-.397.893-1.04 1.04-1.64.025-.248-.025-.596-.124-.796-.099-.198-.596-.745-.596-.795v-.01c0-.198.124-.397.198-.546l.396-.596c.149-.198.174-.348.198-.496v-.01c0-.174-.025-.348-.099-.496-.099-.198-.546-.596-.843-.992z"/>
            </svg>
            Escribinos por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#1A1A1A] text-white/70">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">
            © 2026 Barrio Cerrado Arasy. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
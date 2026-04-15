'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface NavItem {
  key: string
  label: string
  href: string
}

interface Props {
  clinicName: string
  logoUrl?: string
  logoWidth?: number
  logoHeight?: number
  items?: NavItem[]
  primary?: string
}

export function MobileNav({ clinicName, logoUrl, logoWidth = 160, logoHeight = 48, items = [], primary = '#1B3A6B' }: Props) {
  const [open, setOpen] = useState(false)

  const defaultItems = [
    { key: 'home', label: 'Inicio', href: '#inicio' },
    { key: 'services', label: 'Servicios', href: '#servicios' },
    { key: 'about', label: 'Nosotros', href: '#nosotros' },
    { key: 'faq', label: 'FAQ', href: '#faq' },
    { key: 'contact', label: 'Contacto', href: '#contacto' },
  ]

  const navItems = items.length > 0 ? items : defaultItems

  return (
    <>
      {/* Desktop Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E5E7EB', display: 'none' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href={`/${clinicName.toLowerCase().replace(/\s+/g, '-')}`} style={{ textDecoration: 'none' }}>
            {logoUrl ? <Image src={logoUrl} alt={clinicName} width={logoWidth} height={logoHeight} style={{ height: 'auto' }} unoptimized /> : <span style={{ color: primary, fontWeight: 700, fontSize: '1.25rem' }}>{clinicName}</span>}
          </Link>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} style={{ color: '#374151', textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem', transition: 'color 0.2s' }}>{item.label}</Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/${clinicName.toLowerCase().replace(/\s+/g, '-')}`}>
          {logoUrl ? <Image src={logoUrl} alt={clinicName} width={120} height={36} style={{ height: 'auto' }} unoptimized /> : <span style={{ color: primary, fontWeight: 700, fontSize: '1rem' }}>{clinicName}</span>}
        </Link>
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#374151', marginBottom: '5px' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#374151', marginBottom: '5px' }} />
          <span style={{ display: 'block', width: '24px', height: '2px', background: '#374151' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '280px', background: 'white', padding: '5rem 1.5rem 1.5rem' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navItems.map((item) => (
                <Link key={item.key} href={item.href} onClick={() => setOpen(false)} style={{ padding: '0.875rem 1rem', color: '#374151', textDecoration: 'none', fontWeight: 500, borderRadius: '8px', transition: 'background 0.2s' }}>{item.label}</Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

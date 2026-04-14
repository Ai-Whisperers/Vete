import { Metadata } from 'next'
import { LandingNav, LandingFooter, FAQSection, CookieConsent, FloatingWhatsApp } from '@/components/landing'

export const metadata: Metadata = {
  title: 'FAQ - LEALTIS',
  description: 'Frequently asked questions about LEALTIS relocation programs and the Paraguay establishment process.',
}

export default function FAQPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-slate-50">
        <FAQSection />
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}

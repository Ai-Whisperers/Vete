import { Metadata } from 'next'
import { LandingNav, LandingFooter, HowItWorks, CookieConsent, FloatingWhatsApp } from '@/components/landing'

export const metadata: Metadata = {
  title: 'How It Works - LEALTIS',
  description: 'Learn the step-by-step process to establish yourself in Paraguay with LEALTIS.',
}

export default function HowItWorksPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <HowItWorks />
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}

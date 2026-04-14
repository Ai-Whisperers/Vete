import { Metadata } from 'next'
import { LandingNav, LandingFooter, HowItWorks } from '@/components/landing'

export const metadata: Metadata = {
  title: 'How It Works - LEALTIS',
  description: 'Learn the step-by-step process to establish yourself in Paraguay with LEALTIS.',
}

export default function HowItWorksPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-8 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
            How It Works
          </h1>
          <p className="text-xl text-slate-600 text-center max-w-2xl mx-auto mb-20">
            Our streamlined process ensures you're ready before you travel, everything happens in one morning in Paraguay, and full setup is completed while you're back home.
          </p>
        </div>
        <HowItWorks />
        <LandingFooter />
      </main>
    </>
  )
}

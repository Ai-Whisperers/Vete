import { Metadata } from 'next'
import { LandingNav, LandingFooter, FAQSection } from '@/components/landing'

export const metadata: Metadata = {
  title: 'FAQ - LEALTIS',
  description: 'Frequently asked questions about LEALTIS relocation programs and the Paraguay establishment process.',
}

export default function FAQPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-8 text-center" style={{ fontFamily: 'var(--font-playfair)' }}>
            Frequently Asked Questions
          </h1>
        </div>
        <FAQSection />
      </main>
      <LandingFooter />
    </>
  )
}

import { Metadata } from 'next'
import { LandingNav, LandingFooter } from '@/components/landing'

export const metadata: Metadata = {
  title: 'Terms of Service - LEALTIS',
  description: 'Terms of service for LEALTIS.',
}

export default function TermsPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20 max-w-3xl">
          <h1 className="text-4xl font-bold text-[#1B3A6B] mb-8">Terms of Service</h1>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-4">
              These terms of service govern your use of the LEALTIS website and services.
            </p>
            <h2 className="text-2xl font-bold text-[#1B3A6B] mt-8 mb-4">Acceptance of Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <h2 className="text-2xl font-bold text-[#1B3A6B] mt-8 mb-4">Services</h2>
            <p className="text-slate-600 mb-4">
              LEALTIS provides professional relocation and business establishment services for individuals and entrepreneurs seeking to establish themselves in Paraguay.
            </p>
            <h2 className="text-2xl font-bold text-[#1B3A6B] mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              LEALTIS shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the services or website.
            </p>
            <p className="text-slate-600 text-sm mt-8 pt-8 border-t border-slate-200">
              Last updated: April 2026
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  )
}

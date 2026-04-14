import { Metadata } from 'next'
import { LandingNav, LandingFooter } from '@/components/landing'

export const metadata: Metadata = {
  title: 'Privacy Policy - LEALTIS',
  description: 'Privacy policy for LEALTIS.',
}

export default function PrivacyPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20 max-w-3xl">
          <h1 className="text-4xl font-bold text-[#1B3A6B] mb-8">Privacy Policy</h1>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-4">
              This privacy policy describes how LEALTIS collects, uses, and protects your personal information.
            </p>
            <h2 className="text-2xl font-bold text-[#1B3A6B] mt-8 mb-4">Information We Collect</h2>
            <p className="text-slate-600 mb-4">
              We collect information you provide directly to us, such as when you fill out a contact form or book a consultation.
            </p>
            <h2 className="text-2xl font-bold text-[#1B3A6B] mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">
              We use the information we collect to respond to your enquiries, provide our services, and improve our website.
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

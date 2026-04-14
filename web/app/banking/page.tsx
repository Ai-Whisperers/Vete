import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { Shield, Building2, FileCheck, Users, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Banking in Paraguay - How LEALTIS Opens Your Account',
  description: 'Banking is the #1 challenge for foreigners in Paraguay. LEALTIS coordinates bank account opening with pre-validation, KYC preparation, and bank relationships.',
  keywords: ['Paraguay bank account', 'open bank account Paraguay foreigner', 'banking Paraguay expat'],
}

export default function BankingPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Banking Access: The #1 Challenge We Solve
            </h1>
            <p className="text-xl text-slate-600">
              Opening a business bank account in Paraguay as a foreigner is notoriously difficult. Here&apos;s how LEALTIS makes it possible.
            </p>
          </div>

          {/* The Problem */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]">The Problem</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">SEPRELAD Enforcement</h3>
                <p className="text-sm text-red-700">Paraguay&apos;s financial intelligence unit has increased AML requirements. Banks are more cautious with foreign clients.</p>
              </div>
              <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">Strict KYC Requirements</h3>
                <p className="text-sm text-red-700">Source of funds documentation, reference letters from home country banks, proof of economic activity — all required.</p>
              </div>
              <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">No Residency = No Account</h3>
                <p className="text-sm text-red-700">Most banks require Paraguayan residency and RUC before even considering an application. Chicken-and-egg problem.</p>
              </div>
            </div>
          </div>

          {/* The Solution */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="h-6 w-6 text-[#C9A84C]" />
              <h2 className="text-2xl font-bold text-[#1B3A6B]">How LEALTIS Solves This</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#1B3A6B]/5 rounded-xl">
                <FileCheck className="h-8 w-8 text-[#1B3A6B] mb-3" />
                <h3 className="font-bold text-[#1B3A6B] mb-2">Pre-Validation</h3>
                <p className="text-slate-600 text-sm">We pre-validate your documentation before you travel. Your bank dossier is prepared and reviewed by our team in advance.</p>
              </div>
              <div className="p-6 bg-[#1B3A6B]/5 rounded-xl">
                <Building2 className="h-8 w-8 text-[#1B3A6B] mb-3" />
                <h3 className="font-bold text-[#1B3A6B] mb-2">Bank Relationships</h3>
                <p className="text-slate-600 text-sm">We work with banks that accept foreign clients and know how to present your profile correctly to compliance officers.</p>
              </div>
              <div className="p-6 bg-[#1B3A6B]/5 rounded-xl">
                <Shield className="h-8 w-8 text-[#1B3A6B] mb-3" />
                <h3 className="font-bold text-[#1B3A6B] mb-2">KYC Preparation</h3>
                <p className="text-slate-600 text-sm">We prepare the complete KYC package: source of funds documentation, bank references, proof of economic activity, SEPRELAD declarations.</p>
              </div>
              <div className="p-6 bg-[#1B3A6B]/5 rounded-xl">
                <Users className="h-8 w-8 text-[#1B3A6B] mb-3" />
                <h3 className="font-bold text-[#1B3A6B] mb-2">Coordinated Sequence</h3>
                <p className="text-slate-600 text-sm">Residency → RUC → Company → Bank Account. We handle the sequence so each step enables the next. No gaps, no delays.</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Don&apos;t let banking be your obstacle</h2>
            <p className="text-slate-300 mb-8">This is exactly why LEALTIS exists. We coordinate everything so your account opening has the highest chance of success.</p>
            <Link href="/contacto" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all">
              Book Free Consultation
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}

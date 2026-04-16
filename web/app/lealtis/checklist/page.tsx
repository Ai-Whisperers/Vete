import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight, Square, Clock, FileText, Plane, Calendar, Home } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Complete Moving to Paraguay Checklist | LEALTIS',
  description: 'Step-by-step moving checklist for relocating to Paraguay. Everything you need before, during, and after your trip — documents, residency, banking, and more.',
  keywords: ['Paraguay moving checklist', 'Paraguay relocation guide', 'Paraguay documents needed', 'move to Paraguay steps'],
}

const sections = [
  {
    icon: Clock,
    title: 'Before You Travel (4–8 Weeks Before)',
    items: [
      'Obtain apostilled birth certificate',
      'Obtain apostilled police clearance (last 3 years)',
      'Obtain apostilled marriage certificate (if applicable)',
      'Get passport photos (specific Paraguayan requirements)',
      'Gather bank statements (6 months, for KYC)',
      'Get reference letter from your home bank',
      'Prepare proof of address documentation',
      'Book flights to Asunción',
      'Book accommodation (recommend Villa Morra or Carmelitas area)',
      'Send documents to LEALTIS for pre-validation',
    ],
  },
  {
    icon: FileText,
    title: 'Document Preparation',
    items: [
      'Apostille all civil documents at your country\'s apostille authority',
      'Translate documents if not in Spanish (LEALTIS handles translations in Paraguay)',
      'Verify passport validity (6+ months remaining)',
      'Prepare source of funds documentation (bank statements, tax returns, employment contracts)',
      'Prepare SEPRELAD declaration (LEALTIS provides template)',
    ],
  },
  {
    icon: Plane,
    title: 'During Your Trip (Operative Day)',
    items: [
      'Residency application at Migraciones',
      'Police clearance from Policía Nacional',
      'INTERPOL clearance',
      'Sworn declarations',
      'Notary appointment for company formation',
      'Bank appointment (coordinated by LEALTIS)',
      'Real estate tour',
      'Open mobile phone account (personal use)',
    ],
  },
  {
    icon: Calendar,
    title: 'After Your Trip (2–6 Weeks)',
    items: [
      'Collect residency card (or have LEALTIS collect and ship)',
      'Collect cédula (national ID)',
      'Receive company formation documents',
      'RUC registration confirmation',
      'Bank account activation',
      'Set up online banking access',
    ],
  },
  {
    icon: Home,
    title: 'Within 3 Months',
    items: [
      'Register with local healthcare provider',
      'Set up utilities if renting long-term',
      'Open personal bank account (after residency)',
      'Get Paraguayan driving license',
      'Register with your country\'s embassy',
      'Set up tax residency documentation',
      'File departure tax return in home country (if applicable)',
    ],
  },
]

export default function ChecklistPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1B3A6B] mb-6" style={{ fontFamily: 'var(--font-playfair)' }}>
              Complete Moving to Paraguay Checklist
            </h1>
            <p className="text-xl text-slate-600">
              A practical timeline-based checklist for your relocation. Everything you need to prepare before, during, and after your move.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section) => (
              <div key={section.title} className="bg-slate-50 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B3A6B]">
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Square className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto mt-20 p-12 bg-[#1B3A6B] rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Don&apos;t manage this alone</h2>
            <p className="text-slate-300 mb-8">
              LEALTIS handles the entire checklist for you. From document preparation to bank account activation — one team, one process.
            </p>
            <Link href="/lealtis/contacto" className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-4 font-bold text-white shadow-lg hover:bg-[#a67c2e] transition-all">
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

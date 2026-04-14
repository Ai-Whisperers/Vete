import Link from 'next/link'
import type { Metadata } from 'next'
import { lealtisConfig } from './config'

export const metadata: Metadata = {
  title: lealtisConfig.seo.title,
  description: lealtisConfig.seo.description,
  keywords: lealtisConfig.seo.keywords,
  openGraph: {
    title: lealtisConfig.seo.title,
    description: lealtisConfig.seo.description,
    type: 'website',
    images: ['/branding/lealtis/images/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: lealtisConfig.seo.title,
    description: lealtisConfig.seo.description,
    images: ['/branding/lealtis/images/og-image.svg'],
  },
}

export default function LealtisHomePage() {
  const { programs, process, trust, faq, seo } = lealtisConfig
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1B3A6B] py-24 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#1B3A6B_0%,#2C4F7D_50%,#1B3A6B_100%)]" />
        </div>
        
        <div className="container relative mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight md:text-6xl">
              Start Your New Life in Paraguay
            </h1>
            <p className="mb-8 text-xl text-gray-200">
              One program. One trip. One team. Complete relocation and investment facilitation for Europeans.
            </p>
            <p className="mb-10 text-lg text-gray-300">
              We combine legal expertise, financial knowledge, and local relationships into a single seamless experience. No more dealing with fragmented providers, hidden fees, or bureaucratic complexity.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/lealtis/program"
                className="rounded-full bg-[#C9A84C] px-8 py-3 text-lg font-semibold text-[#1B3A6B] transition-colors hover:bg-[#D4BC6E]"
              >
                View Programs
              </Link>
              <Link
                href="/lealtis/contact"
                className="rounded-full border-2 border-white px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-[#F8F7F5] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-[#1B3A6B]">Why Clients Trust LEALTIS</h2>
            <p className="mt-2 text-[#4A4A4A]">We combine legal expertise, financial knowledge, and local relationships into a single seamless experience.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {trust.map((item, i) => (
              <div key={i} className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-3 font-heading text-xl font-bold text-[#1B3A6B]">{item.title}</h3>
                <p className="text-[#4A4A4A]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-[#1B3A6B]">Our Programs</h2>
            <p className="mt-2 text-[#4A4A4A]">Choose the path that fits your goals.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-lg border-2 border-[#E5E5E5] p-8">
              <h3 className="font-heading text-2xl font-bold text-[#1B3A6B]">{programs.business.name}</h3>
              <p className="mt-2 text-[#4A4A4A]">{programs.business.name} — everything you need to establish yourself in Paraguay.</p>
              <p className="mt-4 text-3xl font-bold text-[#1B3A6B]">${programs.business.price.toLocaleString()}</p>
              <ul className="mt-6 space-y-2">
                {programs.business.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                    <span className="h-2 w-2 rounded-full bg-[#C9A84C]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/lealtis/program"
                className="mt-6 inline-block rounded-full border-2 border-[#1B3A6B] px-6 py-2 text-[#1B3A6B] transition-colors hover:bg-[#1B3A6B] hover:text-white"
              >
                Learn More
              </Link>
            </div>
            
            <div className="relative rounded-lg border-2 border-[#C9A84C] bg-[#FEFEFE] p-8">
              <div className="absolute -right-3 -top-3 rounded-full bg-[#C9A84C] px-3 py-1 text-xs font-bold text-[#1B3A6B]">POPULAR</div>
              <h3 className="font-heading text-2xl font-bold text-[#1B3A6B]">{programs.investor.name}</h3>
              <p className="mt-2 text-[#4A4A4A]">The complete package with 12 months of accounting, legal advisory, and investment support.</p>
              <p className="mt-4 text-3xl font-bold text-[#1B3A6B]">${programs.investor.price.toLocaleString()}</p>
              <ul className="mt-6 space-y-2">
                {programs.investor.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                    <span className="h-2 w-2 rounded-full bg-[#C9A84C]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/lealtis/program"
                className="mt-6 inline-block rounded-full bg-[#1B3A6B] px-6 py-2 text-white transition-colors hover:bg-[#2C4F7D]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-[#F8F7F5] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-[#1B3A6B]">How It Works</h2>
            <p className="mt-2 text-[#4A4A4A]">Five simple steps from Europe to Paraguay.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {process.map((p) => (
              <div key={p.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B3A6B] text-xl font-bold text-white">
                  {p.step}
                </div>
                <h3 className="mb-2 font-heading font-bold text-[#1B3A6B]">{p.title}</h3>
                <p className="text-sm text-[#4A4A4A]">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-[#1B3A6B]">Frequently Asked Questions</h2>
            <p className="mt-2 text-[#4A4A4A]">Quick answers to common questions.</p>
          </div>
          
          <div className="mx-auto max-w-2xl space-y-4">
            {faq.slice(0, 4).map((item, i) => (
              <div key={i} className="rounded-lg border border-[#E5E5E5] p-4">
                <h3 className="font-semibold text-[#1B3A6B]">{item.question}</h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">{item.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/lealtis/faq" className="text-[#1B3A6B] hover:underline">
              See All Questions →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="font-heading text-3xl font-bold">Ready to Make the Move?</h2>
          <p className="mt-2 text-gray-300">Book a free consultation to discuss your relocation goals.</p>
          <Link
            href="/lealtis/contact"
            className="mt-6 inline-block rounded-full bg-[#C9A84C] px-8 py-3 text-lg font-semibold text-[#1B3A6B] transition-colors hover:bg-[#D4BC6E]"
          >
            Schedule Consultation
          </Link>
        </div>
      </section>
    </div>
  )
}
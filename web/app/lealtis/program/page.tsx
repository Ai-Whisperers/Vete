import Link from 'next/link'
import { lealtisConfig } from '../config'

export default function LealtisProgramPage() {
  const { programs, process } = lealtisConfig
  
  return (
    <div className="flex flex-col">
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold">Our Programs</h1>
            <p className="mt-2 text-xl text-gray-200">Complete relocation solutions tailored to your goals.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Business Program */}
            <div className="rounded-lg border-2 border-[#E5E5E5] p-8">
              <h2 className="font-heading text-2xl font-bold text-[#1B3A6B]">{programs.business.name}</h2>
              <p className="mt-2 text-[#4A4A4A]">Complete operational establishment in Paraguay. Residency, company, bank account — all in one program.</p>
              <p className="mt-4 text-4xl font-bold text-[#1B3A6B]">${programs.business.price.toLocaleString()}</p>
              <p className="text-sm text-[#6B6B6B]">One-time fee</p>
              
              <div className="mt-6">
                <h3 className="font-semibold text-[#1B3A6B]">What's Included:</h3>
                <ul className="mt-3 space-y-2">
                  {programs.business.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#4A4A4A]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C9A84C]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-[#1B3A6B]">Not Included:</h3>
                <ul className="mt-3 space-y-2">
                  {programs.business.not_included.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E5E5E5]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link
                href="/lealtis/contact"
                className="mt-8 inline-block w-full rounded-full bg-[#1B3A6B] py-3 text-center font-semibold text-white transition-colors hover:bg-[#2C4F7D]"
              >
                Get Started
              </Link>
            </div>
            
            {/* Investor Program */}
            <div className="relative rounded-lg border-2 border-[#C9A84C] bg-[#FEFEFE] p-8">
              <div className="absolute -right-3 -top-3 rounded-full bg-[#C9A84C] px-4 py-1 text-sm font-bold text-[#1B3A6B]">POPULAR</div>
              <h2 className="font-heading text-2xl font-bold text-[#1B3A6B]">{programs.investor.name}</h2>
              <p className="mt-2 text-[#4A4A4A]">The complete package with 12 months of accounting, legal advisory, and investment support.</p>
              <p className="mt-4 text-4xl font-bold text-[#1B3A6B]">${programs.investor.price.toLocaleString()}</p>
              <p className="text-sm text-[#6B6B6B]">One-time fee (12 months included)</p>
              
              <div className="mt-6">
                <h3 className="font-semibold text-[#1B3A6B]">What's Included:</h3>
                <ul className="mt-3 space-y-2">
                  {programs.investor.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#4A4A4A]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C9A84C]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-[#1B3A6B]">Not Included:</h3>
                <ul className="mt-3 space-y-2">
                  {programs.investor.not_included.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E5E5E5]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link
                href="/lealtis/contact"
                className="mt-8 inline-block w-full rounded-full bg-[#1B3A6B] py-3 text-center font-semibold text-white transition-colors hover:bg-[#2C4F7D]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-[#F8F7F5] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold text-[#1B3A6B]">How the Process Works</h2>
          
          <div className="space-y-6">
            {process.map((p) => (
              <div key={p.step} className="flex items-start gap-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B] text-xl font-bold text-white">
                  {p.step}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">{p.title}</h3>
                  <p className="mt-1 text-[#4A4A4A]">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center md:px-6">
          <h2 className="font-heading text-2xl font-bold text-[#1B3A6B]">Ready to get started?</h2>
          <p className="mt-2 text-[#4A4A4A]">Book a free consultation to discuss your relocation goals.</p>
          <Link
            href="/lealtis/contact"
            className="mt-6 inline-block rounded-full bg-[#1B3A6B] px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#2C4F7D]"
          >
            Book Consultation
          </Link>
        </div>
      </section>
    </div>
  )
}
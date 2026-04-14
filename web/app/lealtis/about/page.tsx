import type { Metadata } from 'next'
import { lealtisConfig } from '../config'

export const metadata: Metadata = {
  title: 'About LEALTIS — Your Bridge to Paraguay',
  description: 'Learn about LEALTIS, our mission to make relocation to Paraguay seamless, transparent, and accessible for Europeans.',
  keywords: ['about LEALTIS', 'Paraguay relocation company', 'relocation experts', 'our team'],
}

export default function LealtisAboutPage() {
  const { trust } = lealtisConfig
  
  return (
    <div className="flex flex-col">
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold">Your Bridge to Paraguay</h1>
            <p className="mt-2 text-xl text-gray-200">
              LEALTIS was founded to make relocation to Paraguay seamless, transparent, and accessible for Europeans seeking a better quality of life and investment opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1B3A6B]">Our Mission</h2>
              <p className="mt-4 text-[#4A4A4A]">
                To make relocation to Paraguay seamless, transparent, and accessible for Europeans seeking a better quality of life and investment opportunities. We combine legal expertise, financial knowledge, and local relationships into a single experience that eliminates the complexity and frustration of fragmented providers.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-[#1B3A6B]">Our Vision</h2>
              <p className="mt-4 text-[#4A4A4A]">
                To be the leading relocation facilitation service in Paraguay, known for integrity, efficiency, and exceptional client outcomes. We believe everyone deserves a clear path to their new life without hidden fees, unexpected delays, or dealing with a dozen different providers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F7F5] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold text-[#1B3A6B]">Our Values</h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {trust.map((item, i) => (
              <div key={i} className="rounded-lg bg-white p-6 text-center shadow-sm">
                <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#4A4A4A]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold text-[#1B3A6B]">What Makes Us Different</h2>
          
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded-lg border border-[#E5E5E5] p-6">
              <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">Banking Relationships</h3>
              <p className="mt-2 text-[#4A4A4A]">The biggest bottleneck for new residents is bank account opening. Our direct relationships with banking managers accelerate this process significantly.</p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] p-6">
              <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">All-Inclusive Pricing</h3>
              <p className="mt-2 text-[#4A4A4A]">No surprise fees. No charges for 'processing' or 'coordination.' The price you see is the price you pay.</p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] p-6">
              <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">Single Point of Contact</h3>
              <p className="mt-2 text-[#4A4A4A]">No dealing with lawyers, accountants, and immigration agents separately. One team handles everything.</p>
            </div>
            <div className="rounded-lg border border-[#E5E5E5] p-6">
              <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">Years of Experience</h3>
              <p className="mt-2 text-[#4A4A4A]">We've helped 20+ clients successfully relocate. We know the shortcuts and the pitfalls.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8F7F5] py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold text-[#1B3A6B]">Our Team</h2>
          
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">Daniel</h3>
              <p className="text-sm font-medium text-[#C9A84C]">Operations Lead</p>
              <p className="mt-2 text-[#4A4A4A]">Based in Paraguay with deep local relationships. Handles all in-country coordination, banking partnerships, and government processing.</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">[Partner Name]</h3>
              <p className="text-sm font-medium text-[#C9A84C]">Business Development</p>
              <p className="mt-2 text-[#4A4A4A]">European market expertise. Handles consultations, client onboarding, and ongoing relationship management.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
import Link from 'next/link'
import type { Metadata } from 'next'
import { lealtisConfig } from '../config'

export const metadata: Metadata = {
  title: 'FAQ — LEALTIS',
  description: 'Frequently asked questions about relocating to Paraguay, residency requirements, timelines, and our services.',
  keywords: ['FAQ Paraguay relocation', 'relocation questions', 'Paraguay residency FAQ', 'move to Paraguay questions'],
}

export default function LealtisFaqPage() {
  const { faq } = lealtisConfig
  
  return (
    <div className="flex flex-col">
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold">Frequently Asked Questions</h1>
            <p className="mt-2 text-xl text-gray-200">Answers to common questions about relocating to Paraguay.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {faq.map((item, i) => (
              <div key={i} className="rounded-lg border border-[#E5E5E5] p-6">
                <h2 className="font-heading text-lg font-bold text-[#1B3A6B]">{item.question}</h2>
                <p className="mt-2 text-[#4A4A4A]">{item.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="font-heading text-xl font-bold text-[#1B3A6B]">Still Have Questions?</h3>
            <p className="mt-2 text-[#4A4A4A]">We're here to help. Get in touch for a free consultation.</p>
            <Link
              href="/lealtis/contact"
              className="mt-4 inline-block rounded-full bg-[#1B3A6B] px-8 py-3 text-white transition-colors hover:bg-[#2C4F7D]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
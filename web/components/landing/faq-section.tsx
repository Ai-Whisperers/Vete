'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How long does the whole process take?',
    answer: '8-12 weeks total. The operative day in Paraguay is just one morning. Document validation happens before your trip (1-2 weeks), and government processing for residency happens after (6-8 weeks while you\'re back home).',
  },
  {
    question: 'How many trips do I need to make?',
    answer: 'Just one. All essential procedures happen in a single day in Paraguay. You arrive, complete everything (residency application, company formation, bank setup), and leave. No need for multiple visits.',
  },
  {
    question: 'What is included in the price?',
    answer: 'Our program includes all professional fees, VAT, official government fees, banking coordination, strategic real estate tour, and complete technical advisory. No hidden charges—the price you see is the price you pay.',
  },
  {
    question: 'What is NOT included?',
    answer: 'International flights, accommodation in Paraguay, personal expenses, and apostilles of your documents in your home country. These are your responsibility to arrange.',
  },
  {
    question: 'Do I need to speak Spanish?',
    answer: 'No. Our team communicates fluently in Dutch, English, German, and Spanish. We handle all interactions with Paraguayan authorities and translate everything for you.',
  },
  {
    question: 'Can I really open a bank account as a foreigner?',
    answer: 'Yes—it\'s the hardest step, which is why we focus on it. Our pre-validation process and direct relationships with banks ensure your account opens. We coordinate everything; you don\'t negotiate directly.',
  },
  {
    question: 'Is the process 100% legal?',
    answer: 'Absolutely. We operate in strict compliance with Paraguayan law. All procedures follow official channels with proper government registration and documentation.',
  },
  {
    question: 'What if I\'m missing a document?',
    answer: 'We identify this during our pre-validation phase—before you travel. This ensures you only come to Paraguay when everything is in order. No surprises, no wasted trips.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Everything you need to know before taking the first step
          </p>
        </div>

        {/* FAQ List */}
        <div className="mx-auto max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white transition-all hover:border-[#C9A84C]"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-[#C9A84C] transition-transform duration-300 ${
                      openIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`px-6 text-slate-600 transition-all duration-300 ${
                    openIndex === idx ? 'max-h-[300px] pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

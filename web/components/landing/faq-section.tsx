'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'

export function FAQSection() {
  const t = useTranslations('faq')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = t.raw('items') as Array<{ question: string; answer: string }>

  return (
    <section id="faq" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-4xl md:text-5xl font-bold text-[#1B3A6B]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`overflow-hidden rounded-xl border-2 bg-white transition-all ${
                  openIndex === idx
                    ? 'border-[#C9A84C] shadow-md shadow-[#C9A84C]/10'
                    : 'border-slate-200 hover:border-[#C9A84C]/50'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-bold text-[#1B3A6B]">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-[#C9A84C] transition-transform duration-300 ${
                      openIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === idx
                      ? 'max-h-[500px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                    <p className="leading-relaxed text-slate-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

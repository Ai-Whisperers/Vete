'use client'

import { useTranslations } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('process')

  const steps = t.raw('steps') as Array<{ title: string; description: string }>

  return (
    <section className="py-20 md:py-32 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-bold text-[#1B3A6B]" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('title')}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-5">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="rounded-xl bg-white border-2 border-slate-200 p-6 h-full hover:border-[#C9A84C] transition-all duration-300">
                {/* Step Number */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B3A6B] text-white font-bold text-lg">
                  {index + 1}
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-bold text-[#1B3A6B]">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              </div>

              {/* Connector Line - Hidden on last step */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden w-8 -translate-y-1/2 translate-x-full md:block">
                  <div className="h-1 w-full bg-gradient-to-r from-[#C9A84C] to-[#C9A84C]/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline note */}
        <div className="mt-16 rounded-xl bg-blue-50 border-l-4 border-[#1B3A6B] p-6">
          <p className="text-center text-slate-700">
            <span className="font-bold text-[#1B3A6B]">Total timeline:</span> 8-12 weeks from initial consultation to full operational setup
          </p>
        </div>
      </div>
    </section>
  )
}

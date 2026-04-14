'use client'

import { Award, Users, Zap, Shield } from 'lucide-react'

export function TrustBadges() {
  const items = [
    {
      icon: Award,
      title: 'Years of Experience',
      description: 'Proven track record in the Paraguayan market',
    },
    {
      icon: Users,
      title: 'Professional Team',
      description: 'Multidisciplinary experts: lawyers, accountants, notaries',
    },
    {
      icon: Zap,
      title: 'Proven Process',
      description: 'Refined system with successful international clients',
    },
    {
      icon: Shield,
      title: 'Complete Transparency',
      description: 'Full-price transparency — no hidden fees',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white border-y border-slate-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#C9A84C]/10 p-4">
                    <Icon className="h-8 w-8 text-[#C9A84C]" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

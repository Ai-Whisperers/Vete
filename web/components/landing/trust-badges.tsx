'use client'

import { useTranslations } from 'next-intl'
import { Clock, Users, UserCheck, ShieldCheck, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  years: Clock,
  clients: Users,
  team: UserCheck,
  guarantee: ShieldCheck,
}

export function TrustBadges() {
  const t = useTranslations('trust')

  const items = t.raw('items') as Array<{ label: string; icon: string }>

  return (
    <section className="py-16 md:py-24 bg-white border-y border-slate-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, idx) => {
            const Icon = iconMap[item.icon] ?? Clock
            return (
              <div key={idx} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-[#C9A84C]/10 p-4">
                    <Icon className="h-8 w-8 text-[#C9A84C]" />
                  </div>
                </div>
                <h3 className="mb-2 font-bold text-[#1B3A6B]">{item.label}</h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

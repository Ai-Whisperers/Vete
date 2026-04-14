import { Metadata } from 'next'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'About LEALTIS - Who We Are',
  description: 'Meet the team behind LEALTIS and learn our mission to make Paraguay relocation simple and professional.',
}

export default async function AboutPage() {
  const t = await getTranslations('about')

  const differenceItems = t.raw('difference.items') as Array<{ title: string; description: string }>
  const teamRoles = t.raw('team.roles') as Array<{ title: string; description: string }>

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('title')}
          </h1>
          <p className="text-xl text-slate-600 mb-20 max-w-3xl">{t('subtitle')}</p>

          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4">{t('mission.title')}</h2>
              <p className="text-slate-700 mb-6 leading-relaxed">
                {t('mission.description')}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5a9e] rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">{t('team.title')}</h2>
              <p className="text-slate-200 mb-6">
                {t('team.description')}
              </p>
              <ul className="space-y-3">
                {teamRoles.map((role, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-[#C9A84C]">✓</span>
                    <span><strong>{role.title}:</strong> {role.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="py-20 bg-slate-50 rounded-2xl px-8">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-8 text-center">{t('difference.title')}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {differenceItems.map((item, idx) => (
                <div key={idx} className="text-center">
                  <h3 className="text-xl font-bold text-[#1B3A6B] mb-3">{item.title}</h3>
                  <p className="text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}

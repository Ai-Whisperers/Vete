import { Metadata } from 'next'
import { LandingNav, LandingFooter, ContactForm, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { Mail, Phone, MapPin } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Contact LEALTIS',
  description: 'Get in touch with the LEALTIS team. Book a free consultation about your Paraguay relocation.',
}

export default async function ContactPage() {
  const t = await getTranslations('contact')

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h1
                className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-8"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                {t('title')}
              </h1>

              <p className="text-xl text-slate-600 mb-12">{t('subtitle')}</p>

              <div className="space-y-6 mb-12">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/10">
                      <Mail className="h-5 w-5 text-[#C9A84C]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1B3A6B]">{t('emailLabel')}</h3>
                    <a
                      href="mailto:hello@lealtis.com"
                      className="text-slate-600 hover:text-[#C9A84C] transition-colors"
                    >
                      hello@lealtis.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/10">
                      <Phone className="h-5 w-5 text-[#C9A84C]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1B3A6B]">{t('phoneLabel')}</h3>
                    <a
                      href="tel:+595981234567"
                      className="text-slate-600 hover:text-[#C9A84C] transition-colors"
                    >
                      +595 (981) 234-567
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/10">
                      <MapPin className="h-5 w-5 text-[#C9A84C]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1B3A6B]">{t('locationLabel')}</h3>
                    <p className="text-slate-600">{t('locationValue')}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border-l-4 border-[#C9A84C]">
                <h3 className="font-bold text-[#1B3A6B] mb-2">{t('responseTitle')}</h3>
                <p className="text-slate-600">{t('responseText')}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">{t('formTitle')}</h2>
              <ContactForm />
            </div>
          </div>

          <div className="mt-12 p-8 bg-slate-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-[#1B3A6B] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              {t('schedule') || 'Schedule a Consultation'}
            </h2>
            <p className="text-slate-600 mb-6">{t('scheduleDesc') || 'Book a free 30-minute video call to discuss your situation.'}</p>
            {process.env.NEXT_PUBLIC_CALENDLY_URL ? (
              <iframe
                src={`${process.env.NEXT_PUBLIC_CALENDLY_URL}?hide_gdpr_banner=1`}
                width="100%"
                height="630"
                frameBorder="0"
                title="Schedule a consultation"
                className="rounded-xl"
              />
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Calendly integration coming soon. Please use the form above or email info@lealtis.com</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}

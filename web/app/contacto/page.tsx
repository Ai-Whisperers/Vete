import { Metadata } from 'next'
import { LandingNav, LandingFooter, ContactForm } from '@/components/landing'
import { Mail, Phone, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact LEALTIS',
  description: 'Get in touch with the LEALTIS team. Book a free consultation about your Paraguay relocation.',
}

export default function ContactPage() {
  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                Get in Touch
              </h1>

              <p className="text-xl text-slate-600 mb-12">
                Have questions about our programs? Ready to take the first step? Let's talk.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/10">
                      <Mail className="h-5 w-5 text-[#C9A84C]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1B3A6B]">Email</h3>
                    <a href="mailto:hello@lealtis.com" className="text-slate-600 hover:text-[#C9A84C] transition-colors">
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
                    <h3 className="font-bold text-[#1B3A6B]">Phone</h3>
                    <a href="tel:+595981234567" className="text-slate-600 hover:text-[#C9A84C] transition-colors">
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
                    <h3 className="font-bold text-[#1B3A6B]">Location</h3>
                    <p className="text-slate-600">Asunción, Paraguay</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6 border-l-4 border-[#C9A84C]">
                <h3 className="font-bold text-[#1B3A6B] mb-2">Response Time</h3>
                <p className="text-slate-600">We respond to all enquiries within 24 hours. Typically much faster!</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-6">Book Your Free Consultation</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  )
}

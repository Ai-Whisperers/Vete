import type { Metadata } from 'next'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Contact LEALTIS — Schedule Your Free Consultation',
  description: 'Get in touch to discuss your relocation to Paraguay. Schedule a free 15-minute consultation or send us a message.',
  keywords: ['contact LEALTIS', 'relocation consultation', 'Paraguay relocation', 'move to Paraguay'],
}

export default function LealtisContactPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold">Contact Us</h1>
            <p className="mt-2 text-xl text-gray-200">Get in touch to discuss your relocation goals.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-xl">
            {/* Calendly Embed */}
            <div className="mb-12 rounded-lg border border-[#E5E5E5] p-6">
              <h2 className="mb-4 font-heading text-xl font-bold text-[#1B3A6B]">Schedule a Free Consultation</h2>
              <p className="mb-4 text-sm text-[#4A4A4A]">Book 15 minutes to discuss your relocation goals.</p>
              <div className="calendly-inline-widget" data-url="https://calendly.com/YOUR-CALENDLY-LINK" style={{ minWidth: '320px', height: '400px' }}></div>
              <script src="https://assets.calendly.com/assets/external/widget.js" async></script>
            </div>
            
            <div className="relative my-12 border-t border-[#E5E5E5]">
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[#6B6B6B]">or</span>
            </div>
            
            {/* Contact Form */}
            <ContactForm />
            
            <div className="mt-12 rounded-lg bg-[#F8F7F5] p-6">
              <h3 className="font-heading text-lg font-bold text-[#1B3A6B]">Other Ways to Reach Us</h3>
              <ul className="mt-4 space-y-3 text-[#4A4A4A]">
                <li><strong>Email:</strong> hello@lealtis.com</li>
                <li><strong>WhatsApp:</strong> +595 981 673 667</li>
                <li><strong>Location:</strong> Asunción, Paraguay</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
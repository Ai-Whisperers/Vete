import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — LEALTIS',
  description: 'LEALTIS Privacy Policy - How we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold">Privacy Policy</h1>
            <p className="mt-2 text-xl text-gray-200">Last updated: April 2026</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8 text-[#4A4A4A]">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">1. Introduction</h2>
              <p className="mt-2">
                LEALTIS ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or contact us regarding relocation to Paraguay.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">2. Information We Collect</h2>
              <p className="mt-2">We may collect the following types of information:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Personal identification information (name, email, phone number)</li>
                <li>Information you provide in consultation forms</li>
                <li>Communication history between you and our team</li>
                <li>Technical data (IP address, browser type, access times)</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">3. How We Use Your Information</h2>
              <p className="mt-2">We use your information to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Provide relocation consultation services</li>
                <li>Process your program enrollment</li>
                <li>Communicate with you about your relocation progress</li>
                <li>Improve our services and website</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">4. Information Sharing</h2>
              <p className="mt-2">
                We do NOT sell, trade, or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Service providers who assist in our operations (with NDA)</li>
                <li>Legal/financial institutions as required for your relocation</li>
                <li>Authorities when required by law</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">5. Data Security</h2>
              <p className="mt-2">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">6. Your Rights</h2>
              <p className="mt-2">You have the right to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">7. Data Retention</h2>
              <p className="mt-2">
                We retain your personal information only as long as necessary to provide our services and comply with legal obligations.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">8. Third-Party Links</h2>
              <p className="mt-2">
                Our website may contain links to third-party sites. We are not responsible for the privacy practices of those sites.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">9. Children's Privacy</h2>
              <p className="mt-2">
                Our services are not intended for individuals under 18. We do not knowingly collect information from children.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">10. Changes to This Policy</h2>
              <p className="mt-2">
                We may update this Privacy Policy periodically. We will notify you of any material changes by posting the new policy on this page.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">11. Contact Us</h2>
              <p className="mt-2">
                If you have questions about this Privacy Policy, contact us at hello@lealtis.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
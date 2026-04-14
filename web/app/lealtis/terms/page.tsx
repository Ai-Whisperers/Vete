export default function TermsPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-[#1B3A6B] py-16 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold">Terms of Service</h1>
            <p className="mt-2 text-xl text-gray-200">Last updated: April 2026</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-8 text-[#4A4A4A]">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing our website, using our services, or contacting LEALTIS for relocation assistance, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">2. Description of Services</h2>
              <p className="mt-2">
                LEALTIS provides relocation and investment facilitation services for individuals seeking to establish themselves in Paraguay. Our services include:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Residency application assistance</li>
                <li>Company formation support</li>
                <li>Bank account opening coordination</li>
                <li>Legal and tax advisory (as per program)</li>
                <li>General relocation guidance</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">3. Program Enrollment & Payment</h2>
              <ul className="mt-2 list-inside list-disc space-y-2">
                <li>Program fees are due in advance before services commence</li>
                <li>Fees cover services explicitly listed in your program</li>
                <li>Government fees are included unless otherwise stated</li>
                <li>Refunds are considered case-by-case for services not rendered</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">4. Client Responsibilities</h2>
              <p className="mt-2">You agree to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Obtain required documents from your home country (passport, background check)</li>
                <li>Handle apostilles as instructed</li>
                <li>Attend in-person appointments as required</li>
                <li>Respond to communications in a timely manner</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">5. Limitation of Liability</h2>
              <ul className="mt-2 list-inside list-disc space-y-2">
                <li>We facilitate but do not guarantee residency approval</li>
                <li>Government processing times are beyond our control</li>
                <li>We are not liable for decisions made by immigration, banks, or other authorities</li>
                <li>Our liability is limited to fees paid for services not rendered</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">6. Disclaimer of Warranties</h2>
              <p className="mt-2">
                Our services are provided "as is" without warranties of any kind. We do not guarantee specific outcomes. Paraguay immigration law and banking policies may change without notice.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">7. Intellectual Property</h2>
              <p className="mt-2">
                All content on this website, including text, graphics, logos, and code, is the property of LEALTIS. You may not copy, reproduce, or distribute our content without written permission.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">8. Confidentiality</h2>
              <p className="mt-2">
                We treat all client information as confidential. We do not disclose your personal information to third parties except as necessary for your relocation services.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">9. Governing Law</h2>
              <p className="mt-2">
                These Terms are governed by the laws of Paraguay. Any disputes will be resolved in Paraguayan courts.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">10. Termination</h2>
              <p className="mt-2">
                Either party may terminate services with written notice. Refunds are processed case-by-case based on work completed.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">11. Entire Agreement</h2>
              <p className="mt-2">
                These Terms constitute the entire agreement between you and LEALTIS regarding our services.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-[#1B3A6B]">12. Contact Us</h2>
              <p className="mt-2">
                Questions about these Terms? Contact us at hello@lealtis.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
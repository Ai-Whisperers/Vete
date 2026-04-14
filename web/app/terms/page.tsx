import { Metadata } from 'next'
import { LandingNav, LandingFooter } from '@/components/landing'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for LEALTIS — conditions governing the use of our website and professional services.',
}

export default async function TermsPage() {
  const t = await getTranslations()

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20 max-w-3xl">
          <h1 className="text-4xl font-bold text-[#1B3A6B] mb-2">
            {t('terms.title')}
          </h1>
          <p className="text-sm text-slate-500 mb-10">
            {t('terms.lastUpdated')}
          </p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-600">
                By accessing the LEALTIS website and/or engaging our services,
                you acknowledge that you have read, understood, and agree to be
                bound by these Terms of Service, together with our Privacy
                Policy. If you do not agree with any part of these terms, you
                must not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                2. Description of Services
              </h2>
              <p className="text-slate-600 mb-3">
                LEALTIS provides professional advisory and coordination services
                for individuals and entrepreneurs seeking to establish themselves
                in Paraguay. Our services include, but are not limited to:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  Residency application coordination and support in Paraguay.
                </li>
                <li>Company formation and tax registration (RUC).</li>
                <li>
                  Business bank account opening coordination with Paraguayan
                  financial institutions.
                </li>
                <li>
                  Document pre-validation, translation, and apostille guidance.
                </li>
                <li>
                  Accounting, legal, and tax advisory services (as per selected
                  program).
                </li>
                <li>
                  Logistics coordination for the operative day in Asunción.
                </li>
              </ul>
              <p className="text-slate-600 mt-3">
                LEALTIS acts as a professional coordinator and advisor. We are
                not a government entity, law firm (unless explicitly stated for
                specific services), or financial institution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                3. Program Pricing and Payment
              </h2>
              <p className="text-slate-600 mb-3">
                Our program prices are fixed and published on our website. The
                following conditions apply:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  <strong>Full payment</strong> is required before services
                  commence, via bank transfer.
                </li>
                <li>
                  Published prices include professional fees, VAT, and
                  Paraguayan government taxes applicable to the standard
                  program.
                </li>
                <li>
                  Prices do not include international flights, accommodation,
                  personal expenses, apostilles or sworn translations in your
                  home country, or services beyond the defined program scope.
                </li>
                <li>
                  Additional services requested beyond the standard program will
                  be quoted separately and require written acceptance.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                4. Client Obligations
              </h2>
              <p className="text-slate-600 mb-3">
                As a client, you agree to:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  Provide truthful, accurate, and complete information and
                  documentation as required for the services.
                </li>
                <li>
                  Submit all documents in the required format and within the
                  timelines communicated by our team.
                </li>
                <li>
                  Be physically present in Paraguay on the agreed operative day.
                </li>
                <li>
                  Comply with all Paraguayan laws and regulations applicable to
                  your residency and business activities.
                </li>
                <li>
                  Inform us promptly of any changes in your personal
                  circumstances that may affect the services.
                </li>
              </ul>
              <p className="text-slate-600 mt-3">
                Failure to provide accurate documentation or comply with the
                above obligations may result in delays, additional costs, or
                inability to complete certain procedures. LEALTIS shall not be
                liable for consequences arising from incomplete or inaccurate
                client-provided information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                5. Limitation of Liability
              </h2>
              <p className="text-slate-600 mb-3">
                To the fullest extent permitted by applicable law:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  LEALTIS provides coordination and advisory services. We do not
                  guarantee the outcome of any government procedure, as these
                  are subject to the discretion of Paraguayan authorities.
                </li>
                <li>
                  We do not guarantee bank account approval, as this is subject
                  to each financial institution&apos;s internal policies and
                  risk assessment.
                </li>
                <li>
                  LEALTIS shall not be liable for indirect, incidental, special,
                  consequential, or punitive damages arising from the use of our
                  services.
                </li>
                <li>
                  Our total liability shall not exceed the amount paid by the
                  client for the specific service giving rise to the claim.
                </li>
                <li>
                  We are not liable for delays or failures caused by government
                  entities, banking institutions, or third parties outside our
                  control.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                6. Refund Policy
              </h2>
              <p className="text-slate-600 mb-3">
                Given the nature of our professional services:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  Fees for services already rendered (document validation,
                  government filings, notary acts, translations) are
                  non-refundable.
                </li>
                <li>
                  If services have not yet commenced, a full refund will be
                  issued within 15 business days of a written cancellation
                  request.
                </li>
                <li>
                  If services have partially commenced, a pro-rata refund may be
                  issued for services not yet rendered, minus an administrative
                  fee of 10%.
                </li>
                <li>
                  No refunds are available after the operative day in Paraguay
                  has been completed.
                </li>
                <li>
                  Government fees and taxes paid on your behalf are
                  non-refundable once submitted to the relevant authorities.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                7. Intellectual Property
              </h2>
              <p className="text-slate-600">
                All content on the LEALTIS website, including but not limited to
                text, graphics, logos, images, and software, is the property of
                LEALTIS or its content suppliers and is protected by applicable
                intellectual property laws. You may not reproduce, distribute,
                modify, or create derivative works from any content on this
                website without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                8. Confidentiality
              </h2>
              <p className="text-slate-600">
                Both parties agree to maintain the confidentiality of all
                information exchanged during the course of the service
                relationship. LEALTIS will not disclose your personal or
                business information to third parties except as required for
                service delivery (as described in our Privacy Policy) or as
                mandated by law. This confidentiality obligation survives the
                termination of the service relationship.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                9. Termination
              </h2>
              <p className="text-slate-600 mb-3">
                Either party may terminate the service agreement under the
                following conditions:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  <strong>By the client:</strong> by providing written notice to{' '}
                  <a
                    href="mailto:info@lealtis.com"
                    className="text-[#1B3A6B] underline"
                  >
                    info@lealtis.com
                  </a>
                  . Refunds will be handled in accordance with our Refund
                  Policy.
                </li>
                <li>
                  <strong>By LEALTIS:</strong> if the client fails to provide
                  required documentation within 60 days of the agreed deadline,
                  engages in illegal activities, or provides false information.
                  Written notice will be given with a reasonable cure period.
                </li>
              </ul>
              <p className="text-slate-600 mt-3">
                Upon termination, all outstanding obligations for services
                already rendered remain due and payable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                10. Governing Law and Dispute Resolution
              </h2>
              <p className="text-slate-600 mb-3">
                These Terms of Service are governed by the laws of the Republic
                of Paraguay. In the event of any dispute:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  The parties shall first attempt to resolve the dispute through
                  good-faith negotiation.
                </li>
                <li>
                  If negotiation is unsuccessful within 30 days, the dispute
                  shall be submitted to the competent courts of Asunción,
                  Paraguay.
                </li>
                <li>
                  For European clients, alternative dispute resolution may be
                  available through the relevant European consumer protection
                  mechanisms where applicable.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                11. Severability
              </h2>
              <p className="text-slate-600">
                If any provision of these Terms of Service is found to be
                invalid or unenforceable by a court of competent jurisdiction,
                the remaining provisions shall continue in full force and effect.
                The invalid or unenforceable provision shall be replaced by a
                valid provision that most closely reflects the intent of the
                original.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                12. Amendments
              </h2>
              <p className="text-slate-600">
                LEALTIS reserves the right to modify these Terms of Service at
                any time. Material changes will be communicated to active clients
                via email and posted on our website with a revised
                &ldquo;Last updated&rdquo; date. Continued use of our services
                after such changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-slate-200">
              <p className="text-slate-600">
                For any questions regarding these Terms of Service, please
                contact us at{' '}
                <a
                  href="mailto:info@lealtis.com"
                  className="text-[#1B3A6B] underline"
                >
                  info@lealtis.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  )
}

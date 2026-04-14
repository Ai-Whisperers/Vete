import { Metadata } from 'next'
import { LandingNav, LandingFooter } from '@/components/landing'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for LEALTIS — how we collect, use, and protect your personal information.',
}

export default async function PrivacyPage() {
  const t = await getTranslations()

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20 max-w-3xl">
          <h1 className="text-4xl font-bold text-[#1B3A6B] mb-2">
            {t('privacy.title')}
          </h1>
          <p className="text-sm text-slate-500 mb-10">
            {t('privacy.lastUpdated')}
          </p>

          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                1. Responsible Party
              </h2>
              <p className="text-slate-600">
                The entity responsible for the processing of your personal data
                is <strong>LEALTIS</strong>, with registered office in Asunción,
                Paraguay. You may contact us at{' '}
                <a
                  href="mailto:info@lealtis.com"
                  className="text-[#1B3A6B] underline"
                >
                  info@lealtis.com
                </a>{' '}
                for any questions relating to this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                2. Categories of Personal Data
              </h2>
              <p className="text-slate-600 mb-3">
                We may collect and process the following categories of personal
                data:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  <strong>Identification data:</strong> full name, date of
                  birth, nationality, passport number, national ID number.
                </li>
                <li>
                  <strong>Contact data:</strong> email address, phone number,
                  postal address.
                </li>
                <li>
                  <strong>Professional data:</strong> occupation, company name,
                  tax identification number.
                </li>
                <li>
                  <strong>Immigration data:</strong> criminal record
                  certificate, birth certificate, marriage certificate (if
                  applicable), apostilled documents.
                </li>
                <li>
                  <strong>Technical data:</strong> IP address, browser type,
                  device information, cookies and usage analytics.
                </li>
                <li>
                  <strong>Financial data:</strong> bank account details required
                  for service delivery (never stored beyond what is necessary).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                3. Purposes of Processing
              </h2>
              <p className="text-slate-600 mb-3">
                Your personal data is processed for the following purposes:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  To provide our residency, company formation, and bank account
                  coordination services.
                </li>
                <li>
                  To communicate with you regarding your application status,
                  document requirements, and service delivery.
                </li>
                <li>
                  To comply with Paraguayan legal and regulatory obligations,
                  including migration and tax requirements.
                </li>
                <li>
                  To respond to your enquiries and provide customer support.
                </li>
                <li>
                  To send relevant updates about our services, only with your
                  prior consent.
                </li>
                <li>
                  To improve our website, services, and user experience through
                  anonymised analytics.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                4. Sharing of Personal Data
              </h2>
              <p className="text-slate-600 mb-3">
                We share your personal data only with the following categories
                of recipients, strictly as necessary for service delivery:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  <strong>Government authorities:</strong> Paraguayan migration
                  department, tax authorities (DGII), and other public bodies as
                  required by law.
                </li>
                <li>
                  <strong>Banking institutions:</strong> for the purpose of
                  opening and maintaining your business bank account.
                </li>
                <li>
                  <strong>Legal professionals:</strong> notaries, lawyers, and
                  translators engaged in your service delivery.
                </li>
                <li>
                  <strong>Service providers:</strong> technology and
                  communication providers who process data on our behalf under
                  data processing agreements.
                </li>
              </ul>
              <p className="text-slate-600 mt-3">
                We do not sell, rent, or trade your personal data to third
                parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                5. International Data Transfers
              </h2>
              <p className="text-slate-600">
                As our services involve procedures in Paraguay and clients
                primarily based in Europe, your data may be transferred between
                Paraguay and European countries. We ensure appropriate safeguards
                are in place, including standard contractual clauses where
                applicable, to protect your data during international transfers
                in accordance with applicable data protection regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                6. Data Retention Periods
              </h2>
              <p className="text-slate-600 mb-3">
                We retain your personal data only for as long as necessary:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  <strong>Service-related data:</strong> retained for the
                  duration of the service plus 5 years for legal and tax
                  compliance purposes.
                </li>
                <li>
                  <strong>Enquiry data:</strong> if you contact us but do not
                  engage our services, your data is retained for 12 months and
                  then deleted.
                </li>
                <li>
                  <strong>Marketing data:</strong> retained until you withdraw
                  consent or request deletion.
                </li>
                <li>
                  <strong>Website analytics:</strong> anonymised within 24 hours;
                  aggregated data retained for 26 months.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                7. Your Rights
              </h2>
              <p className="text-slate-600 mb-3">
                In accordance with applicable data protection legislation
                (including the EU General Data Protection Regulation where
                applicable), you have the following rights:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  <strong>Right of access:</strong> request a copy of the
                  personal data we hold about you.
                </li>
                <li>
                  <strong>Right to rectification:</strong> request correction of
                  inaccurate or incomplete data.
                </li>
                <li>
                  <strong>Right to erasure:</strong> request deletion of your
                  personal data, subject to legal retention obligations.
                </li>
                <li>
                  <strong>Right to restriction:</strong> request limitation of
                  processing in certain circumstances.
                </li>
                <li>
                  <strong>Right to data portability:</strong> receive your data
                  in a structured, machine-readable format.
                </li>
                <li>
                  <strong>Right to object:</strong> object to processing based on
                  legitimate interests or for direct marketing purposes.
                </li>
                <li>
                  <strong>Right to withdraw consent:</strong> withdraw your
                  consent at any time where processing is based on consent.
                </li>
              </ul>
              <p className="text-slate-600 mt-3">
                To exercise any of these rights, please contact us at{' '}
                <a
                  href="mailto:info@lealtis.com"
                  className="text-[#1B3A6B] underline"
                >
                  info@lealtis.com
                </a>
                . We will respond to your request within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                8. Security Measures
              </h2>
              <p className="text-slate-600 mb-3">
                We implement appropriate technical and organisational measures to
                protect your personal data against unauthorised access,
                alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  Encryption of data in transit (TLS/SSL) and at rest where
                  applicable.
                </li>
                <li>
                  Access controls limiting data access to authorised personnel
                  on a need-to-know basis.
                </li>
                <li>Regular security assessments and vulnerability monitoring.</li>
                <li>
                  Secure document storage and destruction procedures for physical
                  records.
                </li>
                <li>Staff training on data protection and confidentiality.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                9. Cookies
              </h2>
              <p className="text-slate-600 mb-3">
                Our website uses cookies to enhance your browsing experience and
                collect usage analytics. We use the following types of cookies:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>
                  <strong>Essential cookies:</strong> necessary for the website
                  to function properly (session management, security).
                </li>
                <li>
                  <strong>Analytics cookies:</strong> help us understand how
                  visitors interact with our website (anonymised, aggregated
                  data).
                </li>
                <li>
                  <strong>Preference cookies:</strong> remember your settings and
                  preferences (language, region).
                </li>
              </ul>
              <p className="text-slate-600 mt-3">
                You can manage your cookie preferences at any time through the
                cookie consent banner or your browser settings. Disabling
                certain cookies may affect website functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B3A6B] mb-3">
                10. Modifications to This Policy
              </h2>
              <p className="text-slate-600">
                We may update this privacy policy from time to time to reflect
                changes in our practices, technologies, or legal requirements.
                We will notify you of material changes by posting the updated
                policy on our website with a revised &ldquo;Last
                updated&rdquo; date. We encourage you to review this policy
                periodically. Continued use of our website or services after
                changes are posted constitutes your acceptance of the revised
                policy.
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-slate-200">
              <p className="text-slate-600">
                For any questions regarding this privacy policy, please contact
                us at{' '}
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

export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'LEALTIS',
          description: 'Professional relocation to Paraguay for European entrepreneurs',
          url: 'https://paragu-ai.com/lealtis',
          logo: 'https://paragu-ai.com/lealtis/logo.svg',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'info@lealtis.com',
            contactType: 'sales',
          },
          sameAs: [],
        }),
      }}
    />
  )
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }),
      }}
    />
  )
}

export function HowToSchema({
  steps,
}: {
  steps: Array<{ title: string; description: string }>
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'Establish in Paraguay with LEALTIS',
          step: steps.map((s, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: s.title,
            text: s.description,
          })),
        }),
      }}
    />
  )
}

export function ServiceSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Relocation Services',
          provider: {
            '@type': 'Organization',
            name: 'LEALTIS',
          },
          areaServed: 'Paraguay',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            itemListElement: [
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Paraguay Business',
                  description: 'Residency, company formation, bank account',
                },
                price: '4400',
                priceCurrency: 'USD',
              },
              {
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: 'Paraguay Investor Program',
                  description: 'Full establishment + 12 months advisory',
                },
                price: '6900',
                priceCurrency: 'USD',
              },
            ],
          },
        }),
      }}
    />
  )
}

export const lealtisConfig = {
  name: 'LEALTIS',
  tagline: 'Your Bridge to Paraguay — Relocation & Investment Solutions',
  description: 'Premium relocation and investment facilitation services for Europeans seeking to establish themselves in Paraguay. One program, one trip, one team.',
  
  programs: {
    business: {
      id: 'paraguay_business',
      name: 'Paraguay Business Program',
      price: 4400,
      features: [
        'Residency application (permanent or temporary)',
        'Paraguayan identity card (Cédula)',
        'Company formation (S.A. or S.R.L.)',
        'Tax ID (RUC)',
        'Business bank account opening',
        'All government processing fees',
        'Logistics and coordination',
        'Advisory session'
      ],
      not_included: [
        'International flights',
        'Accommodation in Paraguay',
        'Personal expenses',
        'Sworn translations',
        'Apostilles in home country',
        'Post-program renewals'
      ]
    },
    investor: {
      id: 'investor_program',
      name: 'Paraguay Investor Program',
      price: 6900,
      features: [
        'Everything in Paraguay Business Program',
        '12 months accounting service',
        'Legal and tax advisory (12 months)',
        'Investment analysis and opportunities',
        'Banking relationship support',
        'Ongoing consultation'
      ],
      not_included: [
        'International flights',
        'Accommodation in Paraguay',
        'Personal expenses',
        'Sworn translations',
        'Apostilles in home country',
        'Post-program renewals'
      ]
    }
  },
  
  process: [
    { step: 1, title: 'Consultation', description: 'We discuss your goals, timeline, and specific needs. No commitment required.' },
    { step: 2, title: 'Documentation', description: 'We prepare all required documents. You handle apostilles in your home country.' },
    { step: 3, title: 'Your Trip to Paraguay', description: 'You travel to Paraguay. We coordinate everything. One morning = all documents ready.' },
    { step: 4, title: 'Processing', description: 'We submit all applications. You can return home while we handle the bureaucracy.' },
    { step: 5, title: 'Results Delivered', description: 'Your residency, company documents, and bank account — shipped to your door.' }
  ],
  
  faq: [
    { question: 'How long does the process take?', answer: 'The in-person process takes one morning. Full residency approval takes 30-60 days.' },
    { question: 'Do I need to speak Spanish?', answer: 'No. We handle all communication with government agencies. English is sufficient.' },
    { question: 'Can I bring my family?', answer: 'Yes. Family members can be included in the residency application.' },
    { question: 'What about taxes?', answer: 'We provide tax advisory as part of the Investor Program. Paraguay offers favorable tax treatment for residents.' },
    { question: 'Is Paraguay safe?', answer: 'Yes. Our clients find the quality of life significantly improved.' },
    { question: 'What documents do I need?', answer: 'Valid passport, birth certificate, and police background check.' },
    { question: 'Can I set up a company remotely?', answer: 'Most steps require one visit to Paraguay. The entire process takes one morning.' },
    { question: 'What if residency is rejected?', answer: 'Rejection is rare. We assess eligibility before starting. If rejected, we discuss alternatives.' }
  ],
  
  seo: {
    title: 'LEALTIS — Relocate to Paraguay',
    description: 'Premium relocation and investment facilitation services for Europeans in Paraguay. Transparent pricing, no hidden fees.',
    keywords: ['relocate to Paraguay', 'Paraguay residency', 'move to Paraguay', 'Paraguay investment', 'European relocation']
  },
  
  trust: [
    { title: 'Banking Relationships', description: 'Direct access to banking managers who accelerate account openings — the main bottleneck for new residents.' },
    { title: 'Transparent Pricing', description: 'One flat fee. No hidden costs. No surprises. What you see is what you pay.' },
    { title: 'Local Expertise', description: 'Years of experience navigating Paraguayan bureaucracy. We handle the complexity so you don\'t have to.' }
  ],
  
  // Translations
  translations: {
    en: { nav: { home: 'Home', programs: 'Programs', about: 'About', faq: 'FAQ', contact: 'Contact', getStarted: 'Get Started' }},
    es: { nav: { home: 'Inicio', programs: 'Programas', about: 'Nosotros', faq: 'Preguntas', contact: 'Contacto', getStarted: 'Comenzar' }},
    de: { nav: { home: 'Start', programs: 'Programme', about: 'Über uns', faq: 'FAQ', contact: 'Kontakt', getStarted: 'Loslegen' }},
    nl: { nav: { home: 'Home', programs: 'Programma\'s', over: 'Over ons', faq: 'FAQ', contact: 'Contact', getStarted: 'Aanmelden' }}
  },
  
  // Why Paraguay content
  whyParaguay: [
    { title: 'Low Cost of Living', description: 'Asunción offers European lifestyle at a fraction of the cost. Good restaurants, safe neighborhoods, and modern amenities.' },
    { title: 'FavorableTax Regime', description: 'Paraguay has no wealth tax, no inheritance tax for direct heirs, and territorial taxation meaning foreign income is not taxed.' },
    { title: 'Growth Potential', description: 'One of the fastest-growing economies in Latin America. Real estate appreciation and business opportunities abound.' },
    { title: 'Strategic Location', description: 'Heart of South America with easy access to São Paulo, Buenos Aires, and Miami. Direct flights to major European cities.' }
  ]
}
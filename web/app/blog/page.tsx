import { Metadata } from 'next'
import Link from 'next/link'
import { LandingNav, LandingFooter, CookieConsent, FloatingWhatsApp } from '@/components/landing'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Blog - LEALTIS',
  description: 'Insights and articles about relocation, entrepreneurship, and business in Paraguay.',
}

export default async function BlogPage() {
  const t = await getTranslations('blog')

  const posts = [
    {
      title: 'Paraguay vs Portugal: The Best Residency Option After NHR Ended',
      excerpt: 'With Portugal\'s NHR regime closed, European entrepreneurs are looking for alternatives. Here\'s an honest comparison of Paraguay vs Portugal for tax residency.',
      date: '2026-04-12',
      slug: 'paraguay-vs-portugal-nhr-alternative',
      category: 'Country Comparison',
    },
    {
      title: 'Paraguay vs Uruguay: Which Is Better for European Entrepreneurs?',
      excerpt: 'Both offer territorial tax systems and Mercosur access. But the differences in cost, speed, and lifestyle are significant. Here\'s the breakdown.',
      date: '2026-04-10',
      slug: 'paraguay-vs-uruguay-comparison',
      category: 'Country Comparison',
    },
    {
      title: 'Paraguay vs Dubai (UAE): Cost, Tax, and Lifestyle Compared',
      excerpt: 'Dubai is glamorous but expensive. Paraguay is affordable but developing. Which makes more sense for your situation? An honest comparison.',
      date: '2026-04-08',
      slug: 'paraguay-vs-dubai-uae-comparison',
      category: 'Country Comparison',
    },
    {
      title: 'How to Open a Bank Account in Paraguay as a Foreigner',
      excerpt: 'Banking is the #1 challenge for expats in Paraguay. Here\'s exactly what documents you need, which banks accept foreigners, and how long it takes.',
      date: '2026-04-06',
      slug: 'open-bank-account-paraguay-foreigner',
      category: 'Banking',
    },
    {
      title: 'Paraguay Tax System Explained: Territorial Taxation for Europeans',
      excerpt: 'How does Paraguay\'s territorial tax system actually work? What\'s taxed, what\'s not, and what\'s changing with OECD pressure.',
      date: '2026-04-04',
      slug: 'paraguay-tax-system-explained',
      category: 'Tax',
    },
    {
      title: 'CRS and Paraguay: What Europeans Need to Know in 2026',
      excerpt: 'Paraguay doesn\'t participate in CRS yet, but that\'s changing. Here\'s what the timeline looks like and what it means for your planning.',
      date: '2026-04-02',
      slug: 'crs-paraguay-information-exchange',
      category: 'Tax',
    },
    {
      title: 'Paraguay Residency: Complete Step-by-Step Process (2026)',
      excerpt: 'From document gathering to cédula delivery — the complete residency process with actual timelines, costs, and tips from experience.',
      date: '2026-03-30',
      slug: 'paraguay-residency-step-by-step',
      category: 'Process',
    },
    {
      title: 'Moving from Netherlands to Paraguay: A Dutch Entrepreneur\'s Guide',
      excerpt: 'Box 3 changes, 30% ruling cuts, and housing crisis — why more Dutch entrepreneurs are considering Paraguay, and what to know before you go.',
      date: '2026-03-28',
      slug: 'moving-netherlands-paraguay-guide',
      category: 'Market Specific',
    },
    {
      title: 'Auswandern nach Paraguay: Was Deutsche wissen müssen',
      excerpt: 'Steuerliche Vorteile, Aufenthaltsrecht, Bankkonto und Lebenshaltungskosten — der komplette Ratgeber für Deutsche, die nach Paraguay auswandern möchten.',
      date: '2026-03-26',
      slug: 'auswandern-paraguay-deutsche-ratgeber',
      category: 'Market Specific',
    },
    {
      title: 'Company Formation in Paraguay: EAS, S.A., and SUACE Explained',
      excerpt: 'Which company type is right for you? EAS (simplified), S.A. (corporation), or SUACE (investor fast-track)? Costs, requirements, and recommendations.',
      date: '2026-03-24',
      slug: 'company-formation-paraguay-eas-sa',
      category: 'Business',
    },
    {
      title: 'Living in Asunción: Cost of Living, Neighborhoods, and Lifestyle',
      excerpt: 'Villa Morra, Carmelitas, or the center? A realistic look at Asunción\'s expat-friendly neighborhoods, rental prices, and daily life.',
      date: '2026-03-22',
      slug: 'living-asuncion-cost-of-living',
      category: 'Lifestyle',
    },
    {
      title: 'Paraguay vs Panama: Which Territorial Tax Haven Is Better?',
      excerpt: 'Both offer zero tax on foreign income. But Panama requires $200K investment while Paraguay costs under $5K. Full comparison inside.',
      date: '2026-03-20',
      slug: 'paraguay-vs-panama-comparison',
      category: 'Country Comparison',
    },
    {
      title: 'The Spain-Paraguay Double Taxation Treaty: What Changed in 2024',
      excerpt: 'Spain signed a DTA with Paraguay in 2024. Here\'s what it means for Spanish entrepreneurs considering the move, including cuarentena fiscal implications.',
      date: '2026-03-18',
      slug: 'spain-paraguay-double-taxation-treaty',
      category: 'Tax',
    },
    {
      title: 'Paraguay Real Estate: Investment Opportunities for Foreigners',
      excerpt: 'Asunción property prices, rental yields, foreign ownership rules, and where to invest. A data-driven guide to Paraguay\'s real estate market.',
      date: '2026-03-16',
      slug: 'paraguay-real-estate-investment-guide',
      category: 'Investment',
    },
    {
      title: 'Digital Nomad in Paraguay: Internet, Coworking, and Remote Work',
      excerpt: 'Paraguay doesn\'t have a digital nomad visa yet, but remote workers are choosing it anyway. Here\'s the reality of working remotely from Asunción.',
      date: '2026-03-14',
      slug: 'digital-nomad-paraguay-remote-work',
      category: 'Lifestyle',
    },
  ]

  return (
    <>
      <LandingNav />
      <main className="min-h-screen pt-28 bg-white">
        <div className="container mx-auto px-4 md:px-6 py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1B3A6B] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('title')}
          </h1>
          <p className="text-xl text-slate-600 mb-20">{t('subtitle')}</p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.slug} className="group rounded-xl border-2 border-slate-200 overflow-hidden hover:border-[#C9A84C] transition-all">
                <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5a9e] h-48 flex items-center justify-center">
                  <span className="text-white/80 text-sm font-semibold bg-white/10 px-4 py-1.5 rounded-full">{post.category}</span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                  </div>

                  <h2 className="text-lg font-bold text-[#1B3A6B] mb-3 group-hover:text-[#C9A84C] transition-colors leading-tight">
                    {post.title}
                  </h2>

                  <p className="text-slate-600 text-sm mb-6">{post.excerpt}</p>

                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#dfc07a] font-semibold text-sm transition-colors">
                    {t('readMore')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}

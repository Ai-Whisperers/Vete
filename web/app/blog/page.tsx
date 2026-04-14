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
      title: 'Why Paraguay Is Attracting European Entrepreneurs',
      excerpt: 'Discover the unique combination of factors that make Paraguay an ideal destination for business relocation.',
      date: '2026-04-10',
      readTime: '5 min read',
    },
    {
      title: 'Understanding Paraguayan Residency: A Complete Guide',
      excerpt: 'Everything you need to know about the residency process, requirements, and timeline.',
      date: '2026-04-05',
      readTime: '7 min read',
    },
    {
      title: 'Banking in Paraguay as a Foreigner: What to Expect',
      excerpt: 'A deep dive into the banking landscape and how LEALTIS streamlines account opening.',
      date: '2026-03-30',
      readTime: '6 min read',
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
            {posts.map((post, idx) => (
              <article key={idx} className="group rounded-xl border-2 border-slate-200 overflow-hidden hover:border-[#C9A84C] transition-all">
                <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5a9e] h-48" />

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h2 className="text-xl font-bold text-[#1B3A6B] mb-3 group-hover:text-[#C9A84C] transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-slate-600 mb-6">{post.excerpt}</p>

                  <Link href="#" className="inline-flex items-center gap-2 text-[#C9A84C] hover:text-[#dfc07a] font-semibold transition-colors">
                    {t('readMore')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-20 p-12 bg-slate-50 rounded-2xl text-center">
            <p className="text-slate-600">{t('comingSoon')}</p>
          </div>
        </div>
      </main>
      <LandingFooter />
      <FloatingWhatsApp />
      <CookieConsent />
    </>
  )
}

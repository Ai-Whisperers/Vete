'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LealtisLogo } from '@/components/lealtis/logo'
import { Linkedin, Instagram, Youtube } from 'lucide-react'

export function LandingFooter() {
  const t = useTranslations('footer')

  const links = t.raw('links') as Record<string, string>
  const legal = t.raw('legal') as Record<string, string>

  return (
    <footer className="bg-[#1B3A6B] text-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LealtisLogo size="md" />
              <span className="text-xl font-bold">LEALTIS</span>
            </div>
            <p className="text-slate-300">{t('tagline')}</p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://linkedin.com/company/lealtis"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/lealtis"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/@lealtis"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/programas" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.programs}
                </Link>
              </li>
              <li>
                <Link href="/por-que-paraguay" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.whyParaguay}
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.about}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.faq}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.blog}
                </Link>
              </li>
              <li>
                <Link href="/comparar" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  Compare Countries
                </Link>
              </li>
              <li>
                <Link href="/banking" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  Banking Access
                </Link>
              </li>
              <li>
                <Link href="/impuestos" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  Tax Guide
                </Link>
              </li>
              <li>
                <Link href="/guia-gratis" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  Free Guide
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {legal.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {legal.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-bold text-white mb-2">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">Get Paraguay insights and relocation tips in your inbox.</p>
            <form action="/api/contact" method="POST" className="flex gap-2">
              <input type="hidden" name="country" value="newsletter" />
              <input type="hidden" name="program_interest" value="newsletter" />
              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-slate-400 px-4 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                type="submit"
                className="rounded-full bg-[#C9A84C] px-6 py-2 text-sm font-bold text-white hover:bg-[#a67c2e] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-slate-400">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

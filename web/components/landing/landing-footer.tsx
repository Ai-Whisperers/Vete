'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LealtisLogo } from '@/components/lealtis/logo'
import { Linkedin } from 'lucide-react'

export function LandingFooter() {
  const t = useTranslations('footer')

  const links = t.raw('links') as Record<string, string>
  const legal = t.raw('legal') as Record<string, string>

  return (
    <footer className="bg-[#1B3A6B] text-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-4 mb-12">
          {/* Branding Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LealtisLogo size="md" />
              <span className="text-xl font-bold">LEALTIS</span>
            </div>
            <p className="text-slate-300">{t('tagline')}</p>
            <div className="mt-6">
              <a
                href="https://linkedin.com/company/lealtis"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
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

          {/* Links Column 2 */}
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
                <Link href="/contacto" className="text-slate-300 hover:text-[#C9A84C] transition-colors">
                  {links.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
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

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 text-center text-slate-400">
          <p>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

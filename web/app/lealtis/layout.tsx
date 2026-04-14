import { Metadata } from 'next'
import Link from 'next/link'
import { lealtisConfig } from './config'

export const metadata: Metadata = {
  title: lealtisConfig.seo.title,
  description: lealtisConfig.seo.description,
  keywords: lealtisConfig.seo.keywords,
}

export default function LealtisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-default)] font-sans text-[#1A1A1A]">
      <style>{`
        :root {
          --primary: #1B3A6B;
          --primary-light: #2C4F7D;
          --secondary: #C9A84C;
          --secondary-light: #D4BC6E;
          --accent: #C9A84C;
          --bg-default: #FEFEFE;
          --bg-subtle: #F8F7F5;
          --text-main: #1A1A1A;
          --text-secondary: #4A4A4A;
          --text-muted: #6B6B6B;
        }
      `}</style>
      
      <header className="sticky top-0 z-50 w-full border-b border-[#E5E5E5] bg-[#FEFEFE]/95 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/lealtis" className="flex items-center gap-3">
            <img src="/branding/lealtis/images/logo.svg" alt="LEALTIS" className="h-10 w-auto" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/lealtis" className="text-[#4A4A4A] hover:text-[#1B3A6B] transition-colors">
              Home
            </Link>
            <Link href="/lealtis/program" className="text-[#4A4A4A] hover:text-[#1B3A6B] transition-colors">
              Programs
            </Link>
            <Link href="/lealtis/about" className="text-[#4A4A4A] hover:text-[#1B3A6B] transition-colors">
              About
            </Link>
            <Link href="/lealtis/why-paraguay" className="text-[#4A4A4A] hover:text-[#1B3A6B] transition-colors">
              Why Paraguay
            </Link>
            <Link href="/lealtis/faq" className="text-[#4A4A4A] hover:text-[#1B3A6B] transition-colors">
              FAQ
            </Link>
            <Link href="/lealtis/contact" className="rounded-full bg-[#1B3A6B] px-6 py-2.5 text-white transition-colors hover:bg-[#2C4F7D]">
              Get Started
            </Link>
            <select 
              onChange={(e) => window.location.href = `/${e.target.value}`}
              className="ml-4 rounded border border-[#E5E5E5] bg-transparent px-2 py-1 text-sm text-[#4A4A4A]"
              defaultValue="en"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="de">DE</option>
              <option value="nl">NL</option>
            </select>
          </nav>
        </div>
      </header>
      
      <main>{children}</main>
      
      <footer className="bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-heading text-xl font-bold text-white">LEALTIS</h3>
              <p className="text-sm text-gray-400">Your Bridge to Paraguay — Relocation & Investment Solutions</p>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Programs</h4>
              <ul className="space-y-2">
                <li><Link href="/lealtis/program" className="text-sm text-gray-400 hover:text-white">Paraguay Business</Link></li>
                <li><Link href="/lealtis/program" className="text-sm text-gray-400 hover:text-white">Investor Program</Link></li>
                <li><Link href="/lealtis/why-paraguay" className="text-sm text-gray-400 hover:text-white">Why Paraguay</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/lealtis/about" className="text-sm text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/lealtis/faq" className="text-sm text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link href="/lealtis/contact" className="text-sm text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/lealtis/privacy" className="text-sm text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/lealtis/terms" className="text-sm text-gray-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>hello@lealtis.com</li>
                <li>+595 981 673 667</li>
                <li>Asunción, Paraguay</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} LEALTIS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
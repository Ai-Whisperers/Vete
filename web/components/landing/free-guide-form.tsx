'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

export function FreeGuideForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          country: 'guide-download',
          program_interest: 'free-guide',
          objective: 'Downloading free Paraguay residency guide',
          source: 'guia-gratis',
        }),
      })

      if (!res.ok) throw new Error('Failed')
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-[#1B3A6B] rounded-2xl p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#C9A84C] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Check your email!</h3>
        <p className="text-slate-300">We&apos;ve sent the guide to your inbox. You&apos;ll also receive our newsletter with Paraguay insights (unsubscribe anytime).</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1B3A6B] rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Get Your Free Guide</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 px-4 py-3 focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 px-4 py-3 focus:outline-none focus:border-[#C9A84C]"
          />
        </div>
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#C9A84C] px-6 py-3 font-bold text-white hover:bg-[#a67c2e] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
          {loading ? 'Sending...' : 'Send Me the Free Guide'}
        </button>
        {error && <p className="text-red-300 text-sm text-center">{error}</p>}
        <p className="text-xs text-slate-400 text-center">No spam. Unsubscribe anytime. We respect your privacy.</p>
      </form>
    </div>
  )
}

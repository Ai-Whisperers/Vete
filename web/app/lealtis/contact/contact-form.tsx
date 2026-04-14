'use client'

import { useState } from 'react'

export function ContactForm() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormState('submitting')
    
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    
    try {
      const res = await fetch('/api/lealtis/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to submit')
      setFormState('success')
    } catch (err) {
      setFormState('error')
    }
  }
  
  return (
    <>
      <h2 className="mb-6 font-heading text-xl font-bold text-[#1B3A6B]">Send Us a Message</h2>
      
      {formState === 'success' ? (
        <div className="rounded-lg bg-green-50 p-6 text-center">
          <h3 className="font-heading text-xl font-bold text-green-800">Thank You!</h3>
          <p className="mt-2 text-green-700">We'll be in touch within 24 hours.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A]">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-2 block w-full rounded-lg border border-[#E5E5E5] px-4 py-3 text-[#1A1A1A] focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A]">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-2 block w-full rounded-lg border border-[#E5E5E5] px-4 py-3 text-[#1A1A1A] focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#1A1A1A]">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="mt-2 block w-full rounded-lg border border-[#E5E5E5] px-4 py-3 text-[#1A1A1A] focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              placeholder="+31 6 12345678"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-[#1A1A1A]">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="mt-2 block w-full rounded-lg border border-[#E5E5E5] px-4 py-3 text-[#1A1A1A] focus:border-[#1B3A6B] focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              placeholder="Tell us about your relocation goals, timeline, and any questions you have..."
            />
          </div>
          
          <button
            type="submit"
            disabled={formState === 'submitting'}
            className="w-full rounded-full bg-[#1B3A6B] py-4 text-lg font-semibold text-white transition-colors hover:bg-[#2C4F7D] disabled:opacity-50"
          >
            {formState === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
          
          {formState === 'error' && (
            <p className="text-center text-red-600">Something went wrong. Please try again or email us directly.</p>
          )}
        </form>
      )}
    </>
  )
}
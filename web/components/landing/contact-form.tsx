'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'

interface FormData {
  name: string
  email: string
  phone: string
  country: string
  programInterest: string
  objective: string
  consent: boolean
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  country: '',
  programInterest: '',
  objective: '',
  consent: false,
}

const countries = [
  'Netherlands',
  'Germany',
  'Belgium',
  'Austria',
  'France',
  'Other Europe',
  'Other',
]

export function ContactForm() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required'
    }
    if (!formData.country) {
      newErrors.country = 'Country is required'
    }
    if (!formData.consent) {
      newErrors.consent = 'You must agree to be contacted'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          locale: 'en',
          source: 'landing_page',
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData(initialFormData)
        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  if (isSubmitted) {
    return (
      <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">Thank you!</h3>
        <p className="text-green-700">
          We've received your request. Our team will contact you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#C9A84C] focus:outline-none transition-colors"
          placeholder="Your full name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#C9A84C] focus:outline-none transition-colors"
          placeholder="your@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#C9A84C] focus:outline-none transition-colors"
          placeholder="+31 6 12345678"
        />
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-semibold text-slate-900 mb-2">
          Country *
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#C9A84C] focus:outline-none transition-colors"
        >
          <option value="">Select your country</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
      </div>

      {/* Program Interest */}
      <div>
        <label htmlFor="programInterest" className="block text-sm font-semibold text-slate-900 mb-2">
          Program Interest
        </label>
        <select
          id="programInterest"
          name="programInterest"
          value={formData.programInterest}
          onChange={handleChange}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#C9A84C] focus:outline-none transition-colors"
        >
          <option value="">Select program</option>
          <option value="Paraguay Business">Paraguay Business (USD 4,400)</option>
          <option value="Paraguay Investor Program">Paraguay Investor Program (USD 6,900)</option>
          <option value="Not sure yet">Not sure yet</option>
        </select>
      </div>

      {/* Objective */}
      <div>
        <label htmlFor="objective" className="block text-sm font-semibold text-slate-900 mb-2">
          What is your main goal in Paraguay?
        </label>
        <textarea
          id="objective"
          name="objective"
          value={formData.objective}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#C9A84C] focus:outline-none transition-colors"
          placeholder="Tell us about your objectives..."
        />
      </div>

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          checked={formData.consent}
          onChange={handleChange}
          className="mt-1 h-4 w-4 rounded border-2 border-slate-300 text-[#1B3A6B] focus:border-[#C9A84C] focus:outline-none cursor-pointer"
        />
        <label htmlFor="consent" className="text-sm text-slate-600">
          I agree to be contacted by LEALTIS regarding my enquiry *
        </label>
      </div>
      {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#1B3A6B] text-white font-bold py-4 transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Send Enquiry'
        )}
      </button>
    </form>
  )
}

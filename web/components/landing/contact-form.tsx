'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle, Loader2 } from 'lucide-react'

interface FormData {
  name: string
  email: string
  phone: string
  country: string
  programInterest: string
  objective: string
  consent: boolean
  website: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  country: '',
  programInterest: '',
  objective: '',
  consent: false,
  website: '',
}

export function ContactForm() {
  const t = useTranslations('contact.form')
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const countries = t.raw('countries') as string[]

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired')
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = t('emailRequired')
    }
    if (!formData.country) {
      newErrors.country = t('countryRequired')
    }
    if (!formData.consent) {
      newErrors.consent = t('consentRequired')
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

    if (formData.website) return

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          programInterest: formData.programInterest,
          objective: formData.objective,
          source: 'landing_page',
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData(initialFormData)
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        setSubmitError(true)
      }
    } catch {
      setSubmitError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  if (isSubmitted) {
    return (
      <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <p className="text-green-700 text-lg">{t('success')}</p>
      </div>
    )
  }

  const inputCls =
    'w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#C9A84C] focus:outline-none transition-colors'
  const labelCls = 'block text-sm font-semibold text-slate-900 mb-2'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="name" className={labelCls}>
          {t('name')} *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputCls}
          placeholder={t('namePlaceholder')}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>
          {t('email')} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={inputCls}
          placeholder={t('emailPlaceholder')}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={labelCls}>
          {t('phone')}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={inputCls}
          placeholder={t('phonePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="country" className={labelCls}>
          {t('country')} *
        </label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className={inputCls}
        >
          <option value="">{t('countryPlaceholder')}</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
      </div>

      <div>
        <label htmlFor="programInterest" className={labelCls}>
          {t('program')} *
        </label>
        <select
          id="programInterest"
          name="programInterest"
          value={formData.programInterest}
          onChange={handleChange}
          className={inputCls}
        >
          <option value="">{t('programPlaceholder')}</option>
          <option value="Paraguay Business">{t('programBusiness')}</option>
          <option value="Paraguay Investor Program">{t('programInvestor')}</option>
          <option value="Not sure yet">{t('programUnsure')}</option>
        </select>
      </div>

      <div>
        <label htmlFor="objective" className={labelCls}>
          {t('objective')}
        </label>
        <textarea
          id="objective"
          name="objective"
          value={formData.objective}
          onChange={handleChange}
          rows={4}
          className={inputCls}
          placeholder={t('objectivePlaceholder')}
        />
      </div>

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
          {t('consent')} *
        </label>
      </div>
      {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{t('error')}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-[#1B3A6B] text-white font-bold py-4 transition-all hover:bg-[#0f2447] hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </button>
    </form>
  )
}

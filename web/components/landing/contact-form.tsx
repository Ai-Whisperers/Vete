'use client'

import { useState } from 'react'
import {
  Send,
  Building2,
  User,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle,
  Loader2,
  Users,
  Globe,
  ArrowRight,
} from 'lucide-react'

interface FormData {
  clinicName: string
  contactName: string
  email: string
  phone: string
  vetCount: string
  hasWebsite: string
  message: string
}

const initialFormData: FormData = {
  clinicName: '',
  contactName: '',
  email: '',
  phone: '',
  vetCount: '',
  hasWebsite: '',
  message: '',
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = 'Ingresa el nombre de tu clinica'
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Ingresa tu nombre'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Ingresa tu email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Ingresa tu telefono'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Build WhatsApp message
    const message = `Hola! Soy ${formData.contactName} de ${formData.clinicName}.

Me interesa unir mi clinica a VetePy.

Datos de contacto:
- Email: ${formData.email}
- Telefono: ${formData.phone}
- Cantidad de veterinarios: ${formData.vetCount || 'No especificado'}
- Tiene sitio web: ${formData.hasWebsite || 'No especificado'}

${formData.message ? `Mensaje adicional: ${formData.message}` : ''}`

    // Simulate a brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/595981324569?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSubmitted) {
    return (
      <section
        id="contacto"
        className="relative overflow-hidden bg-gradient-to-b from-[var(--bg-dark-alt)] to-[var(--bg-dark)] py-20 md:py-28"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-lg text-center">
            <div className="bg-[var(--primary)]/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <CheckCircle className="h-10 w-10 text-[var(--primary)]" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">¡Mensaje Enviado!</h2>
            <p className="mb-8 text-white/60">
              Se abrio WhatsApp con tus datos. Si no se abrio automaticamente, hace click en el
              boton de abajo.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href={`https://wa.me/595981324569?text=${encodeURIComponent(`Hola! Soy ${formData.contactName} de ${formData.clinicName}. Me interesa VetePy.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white transition-all hover:bg-[#20BD5A]"
              >
                <MessageCircle className="h-5 w-5" />
                Abrir WhatsApp
              </a>
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData(initialFormData)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10"
              >
                Enviar Otro Mensaje
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="contacto"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--bg-dark-alt)] to-[var(--bg-dark)] py-20 md:py-28"
    >
      {/* Background decoration */}
      <div className="bg-[var(--primary)]/5 absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full blur-[150px]" />
      <div className="bg-[var(--secondary)]/5 absolute bottom-1/4 right-0 h-[400px] w-[400px] rounded-full blur-[150px]" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
            Contacto
          </span>
          <h2 className="mb-6 text-3xl font-black text-white md:text-4xl lg:text-5xl">
            Contanos sobre tu clinica
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Completa el formulario y te contactamos para explicarte como funciona VetePy y responder
            todas tus preguntas.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Clinic Name */}
                <div>
                  <label className="mb-2 block text-sm text-white/70">Nombre de la Clinica *</label>
                  <div className="relative" suppressHydrationWarning>
                    <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={formData.clinicName}
                      onChange={(e) => handleChange('clinicName', e.target.value)}
                      placeholder="Veterinaria Mi Mascota"
                      data-lpignore="true"
                      data-form-type="other"
                      className={`w-full rounded-xl border bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/30 transition-all focus:outline-none ${
                        errors.clinicName
                          ? 'border-red-500'
                          : 'focus:border-[var(--primary)]/50 border-white/10'
                      }`}
                    />
                  </div>
                  {errors.clinicName && (
                    <p className="mt-1 text-sm text-red-400">{errors.clinicName}</p>
                  )}
                </div>

                {/* Contact Name */}
                <div>
                  <label className="mb-2 block text-sm text-white/70">Tu Nombre *</label>
                  <div className="relative" suppressHydrationWarning>
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleChange('contactName', e.target.value)}
                      placeholder="Dr. Juan Perez"
                      data-lpignore="true"
                      data-form-type="other"
                      className={`w-full rounded-xl border bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/30 transition-all focus:outline-none ${
                        errors.contactName
                          ? 'border-red-500'
                          : 'focus:border-[var(--primary)]/50 border-white/10'
                      }`}
                    />
                  </div>
                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-400">{errors.contactName}</p>
                  )}
                </div>

                {/* Email and Phone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Email *</label>
                    <div className="relative" suppressHydrationWarning>
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="juan@clinica.com"
                        data-lpignore="true"
                        data-form-type="other"
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/30 transition-all focus:outline-none ${
                          errors.email
                            ? 'border-red-500'
                            : 'focus:border-[var(--primary)]/50 border-white/10'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Telefono/WhatsApp *</label>
                    <div className="relative" suppressHydrationWarning>
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="0981 123 456"
                        data-lpignore="true"
                        data-form-type="other"
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-12 pr-4 text-white placeholder-white/30 transition-all focus:outline-none ${
                          errors.phone
                            ? 'border-red-500'
                            : 'focus:border-[var(--primary)]/50 border-white/10'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                  </div>
                </div>

                {/* Vet Count and Website */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-white/70">
                      Cantidad de Veterinarios
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <select
                        value={formData.vetCount}
                        onChange={(e) => handleChange('vetCount', e.target.value)}
                        className="focus:border-[var(--primary)]/50 w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white transition-all focus:outline-none"
                      >
                        <option value="" className="bg-[var(--bg-dark)]">
                          Seleccionar
                        </option>
                        <option value="1" className="bg-[var(--bg-dark)]">
                          1 veterinario
                        </option>
                        <option value="2-3" className="bg-[var(--bg-dark)]">
                          2-3 veterinarios
                        </option>
                        <option value="4-6" className="bg-[var(--bg-dark)]">
                          4-6 veterinarios
                        </option>
                        <option value="7+" className="bg-[var(--bg-dark)]">
                          7 o mas
                        </option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">¿Tenes sitio web?</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                      <select
                        value={formData.hasWebsite}
                        onChange={(e) => handleChange('hasWebsite', e.target.value)}
                        className="focus:border-[var(--primary)]/50 w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white transition-all focus:outline-none"
                      >
                        <option value="" className="bg-[var(--bg-dark)]">
                          Seleccionar
                        </option>
                        <option value="no" className="bg-[var(--bg-dark)]">
                          No, no tengo
                        </option>
                        <option value="basic" className="bg-[var(--bg-dark)]">
                          Si, basico (Facebook/Insta)
                        </option>
                        <option value="yes" className="bg-[var(--bg-dark)]">
                          Si, tengo sitio web
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block text-sm text-white/70">Mensaje (opcional)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Contanos que te gustaria lograr con VetePy, dudas que tengas, etc."
                    rows={4}
                    className="focus:border-[var(--primary)]/50 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-all focus:outline-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hover:shadow-[var(--primary)]/20 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-4 font-bold text-[var(--bg-dark)] transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar por WhatsApp
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-white/40">
                  Al enviar, se abrira WhatsApp con tus datos. Respondemos en menos de 24 horas.
                </p>
              </form>
            </div>

            {/* Side info */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                {/* Direct contact */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="mb-4 font-bold text-white">Contacto Directo</h3>
                  <div className="space-y-4">
                    <a
                      href="https://wa.me/595981324569"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/70 transition-colors hover:text-[#25D366]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/20">
                        <MessageCircle className="h-5 w-5 text-[#25D366]" />
                      </div>
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm text-white/50">+595 981 324 569</p>
                      </div>
                    </a>
                    <a
                      href="mailto:contacto@vetepy.com"
                      className="flex items-center gap-3 text-white/70 transition-colors hover:text-[var(--primary)]"
                    >
                      <div className="bg-[var(--primary)]/20 flex h-10 w-10 items-center justify-center rounded-lg">
                        <Mail className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-white/50">contacto@vetepy.com</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* What to expect */}
                <div className="from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-2xl border border-white/10 bg-gradient-to-br p-6">
                  <h3 className="mb-4 font-bold text-white">¿Que sigue despues?</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--bg-dark)]">
                        1
                      </span>
                      <span className="text-white/70">
                        Te contactamos por WhatsApp para conocer tu clinica
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--bg-dark)]">
                        2
                      </span>
                      <span className="text-white/70">Te mostramos una demo personalizada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-xs font-bold text-white">
                        3
                      </span>
                      <span className="text-white/70">
                        Si te interesa, comenzamos la configuracion
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Guarantee */}
                <div className="text-center text-sm text-white/40">
                  <p>Sin compromiso. Sin presion.</p>
                  <p>Solo una conversacion para conocernos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client';

import { useState } from 'react';
import {
  Send, Building2, User, Mail, Phone,
  MessageCircle, CheckCircle, Loader2, Users,
  Globe, ArrowRight
} from 'lucide-react';

interface FormData {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  vetCount: string;
  hasWebsite: string;
  message: string;
}

const initialFormData: FormData = {
  clinicName: '',
  contactName: '',
  email: '',
  phone: '',
  vetCount: '',
  hasWebsite: '',
  message: ''
};

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = 'Ingresa el nombre de tu clinica';
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Ingresa tu nombre';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Ingresa tu email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Ingresa tu telefono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Build WhatsApp message
    const message = `Hola! Soy ${formData.contactName} de ${formData.clinicName}.

Me interesa unir mi clinica a VetePy.

Datos de contacto:
- Email: ${formData.email}
- Telefono: ${formData.phone}
- Cantidad de veterinarios: ${formData.vetCount || 'No especificado'}
- Tiene sitio web: ${formData.hasWebsite || 'No especificado'}

${formData.message ? `Mensaje adicional: ${formData.message}` : ''}`;

    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/595981324569?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <section id="contacto" className="py-20 md:py-28 bg-gradient-to-b from-[var(--bg-dark-alt)] to-[var(--bg-dark)] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[var(--primary)]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Mensaje Enviado!
            </h2>
            <p className="text-white/60 mb-8">
              Se abrio WhatsApp con tus datos. Si no se abrio automaticamente,
              hace click en el boton de abajo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/595981324569?text=${encodeURIComponent(`Hola! Soy ${formData.contactName} de ${formData.clinicName}. Me interesa VetePy.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#20BD5A] transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Abrir WhatsApp
              </a>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData(initialFormData);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all"
              >
                Enviar Otro Mensaje
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contacto" className="py-20 md:py-28 bg-gradient-to-b from-[var(--bg-dark-alt)] to-[var(--bg-dark)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-[var(--secondary)]/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-3">
            Contacto
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
            Contanos sobre tu clinica
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Completa el formulario y te contactamos para explicarte como funciona VetePy
            y responder todas tus preguntas.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Clinic Name */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Nombre de la Clinica *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.clinicName}
                      onChange={(e) => handleChange('clinicName', e.target.value)}
                      placeholder="Veterinaria Mi Mascota"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none transition-all ${
                        errors.clinicName ? 'border-red-500' : 'border-white/10 focus:border-[var(--primary)]/50'
                      }`}
                    />
                  </div>
                  {errors.clinicName && (
                    <p className="text-red-400 text-sm mt-1">{errors.clinicName}</p>
                  )}
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Tu Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => handleChange('contactName', e.target.value)}
                      placeholder="Dr. Juan Perez"
                      className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none transition-all ${
                        errors.contactName ? 'border-red-500' : 'border-white/10 focus:border-[var(--primary)]/50'
                      }`}
                    />
                  </div>
                  {errors.contactName && (
                    <p className="text-red-400 text-sm mt-1">{errors.contactName}</p>
                  )}
                </div>

                {/* Email and Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="juan@clinica.com"
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none transition-all ${
                          errors.email ? 'border-red-500' : 'border-white/10 focus:border-[var(--primary)]/50'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Telefono/WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="0981 123 456"
                        className={`w-full pl-12 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none transition-all ${
                          errors.phone ? 'border-red-500' : 'border-white/10 focus:border-[var(--primary)]/50'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Vet Count and Website */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Cantidad de Veterinarios
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <select
                        value={formData.vetCount}
                        onChange={(e) => handleChange('vetCount', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[var(--primary)]/50 focus:outline-none transition-all appearance-none"
                      >
                        <option value="" className="bg-[var(--bg-dark)]">Seleccionar</option>
                        <option value="1" className="bg-[var(--bg-dark)]">1 veterinario</option>
                        <option value="2-3" className="bg-[var(--bg-dark)]">2-3 veterinarios</option>
                        <option value="4-6" className="bg-[var(--bg-dark)]">4-6 veterinarios</option>
                        <option value="7+" className="bg-[var(--bg-dark)]">7 o mas</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      ¿Tenes sitio web?
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <select
                        value={formData.hasWebsite}
                        onChange={(e) => handleChange('hasWebsite', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[var(--primary)]/50 focus:outline-none transition-all appearance-none"
                      >
                        <option value="" className="bg-[var(--bg-dark)]">Seleccionar</option>
                        <option value="no" className="bg-[var(--bg-dark)]">No, no tengo</option>
                        <option value="basic" className="bg-[var(--bg-dark)]">Si, basico (Facebook/Insta)</option>
                        <option value="yes" className="bg-[var(--bg-dark)]">Si, tengo sitio web</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Contanos que te gustaria lograr con VetePy, dudas que tengas, etc."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[var(--primary)]/50 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-[var(--bg-dark)] font-bold rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar por WhatsApp
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-white/40 text-sm text-center">
                  Al enviar, se abrira WhatsApp con tus datos. Respondemos en menos de 24 horas.
                </p>
              </form>
            </div>

            {/* Side info */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                {/* Direct contact */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-white font-bold mb-4">Contacto Directo</h3>
                  <div className="space-y-4">
                    <a
                      href="https://wa.me/595981324569"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/70 hover:text-[#25D366] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#25D366]/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      </div>
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm text-white/50">+595 981 324 569</p>
                      </div>
                    </a>
                    <a
                      href="mailto:contacto@vetepy.com"
                      className="flex items-center gap-3 text-white/70 hover:text-[var(--primary)] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-white/50">contacto@vetepy.com</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* What to expect */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-white/10">
                  <h3 className="text-white font-bold mb-4">¿Que sigue despues?</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--bg-dark)] font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                      <span className="text-white/70">Te contactamos por WhatsApp para conocer tu clinica</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-[var(--bg-dark)] font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                      <span className="text-white/70">Te mostramos una demo personalizada</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--secondary)] text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                      <span className="text-white/70">Si te interesa, comenzamos la configuracion</span>
                    </li>
                  </ol>
                </div>

                {/* Guarantee */}
                <div className="text-center text-white/40 text-sm">
                  <p>Sin compromiso. Sin presion.</p>
                  <p>Solo una conversacion para conocernos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

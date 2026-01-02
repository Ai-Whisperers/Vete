"use client";

import { useState, useEffect } from "react";

interface NewsletterFormProps {
  clinic: string;
  title?: string;
  placeholder?: string;
  buttonText?: string;
}

// Skeleton that matches the form layout for SSR
function NewsletterSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
      <div className="text-center md:text-left">
        <div className="h-6 w-48 bg-white/20 rounded mb-2" />
        <div className="h-4 w-64 bg-white/10 rounded" />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <div className="flex-1 md:w-64 h-12 bg-white/10 rounded-xl" />
        <div className="w-24 h-12 bg-white/20 rounded-xl" />
      </div>
    </div>
  );
}

export function NewsletterForm({
  clinic,
  title = "Suscríbete a nuestro boletín",
  placeholder = "Tu email",
  buttonText = "Enviar",
}: NewsletterFormProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show skeleton during SSR and initial client render
  // This prevents hydration mismatch from browser extensions (LastPass, etc.)
  if (!isMounted) {
    return <NewsletterSkeleton />;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-center md:text-left">
        <h4 id="newsletter-heading" className="font-bold text-white text-lg mb-1">
          {title}
        </h4>
        <p className="text-gray-400 text-sm">
          Recibe tips de cuidado, ofertas exclusivas y novedades.
        </p>
      </div>
      <form className="flex gap-2 w-full md:w-auto" action="/api/newsletter" method="POST">
        <input type="hidden" name="clinic" value={clinic} />
        <label htmlFor="newsletter-email" className="sr-only">
          Correo electrónico para suscripción
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          placeholder={placeholder}
          required
          aria-required="true"
          autoComplete="off"
          data-lpignore="true"
          data-form-type="other"
          className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}

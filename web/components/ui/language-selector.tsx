'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

interface LanguageSelectorProps {
  currentLocale: Locale;
  className?: string;
  variant?: 'dropdown' | 'inline';
}

export function LanguageSelector({
  currentLocale,
  className = '',
  variant = 'dropdown',
}: LanguageSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Set the cookie via API
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });

      startTransition(() => {
        router.refresh();
        setIsOpen(false);
      });
    } catch (error) {
      console.error('Failed to change locale:', error);
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            disabled={isPending}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${locale === currentLocale
                ? 'bg-[var(--primary)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
              ${isPending ? 'opacity-50 cursor-wait' : ''}
            `}
            aria-pressed={locale === currentLocale}
            aria-label={`Cambiar idioma a ${localeNames[locale]}`}
          >
            <span aria-hidden="true">{localeFlags[locale]}</span>
            <span>{locale.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium
          hover:bg-gray-50 transition-colors
          dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-200
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Seleccionar idioma"
        disabled={isPending}
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span>{localeFlags[currentLocale]}</span>
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <ul
            role="listbox"
            className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-700"
            aria-label="Idiomas disponibles"
          >
            {locales.map((locale) => (
              <li key={locale}>
                <button
                  role="option"
                  aria-selected={locale === currentLocale}
                  onClick={() => handleLocaleChange(locale)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors
                    ${locale === currentLocale
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span aria-hidden="true">{localeFlags[locale]}</span>
                  <span className="flex-1">{localeNames[locale]}</span>
                  {locale === currentLocale && (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

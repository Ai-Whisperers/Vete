'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Cookie, X } from 'lucide-react'

type ConsentLevel = 'all' | 'essential' | 'custom'
interface Preferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'lealtis_cookie_consent'

function getStoredConsent(): ConsentLevel | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY) as ConsentLevel | null
  } catch {
    return null
  }
}

function setStoredConsent(level: ConsentLevel) {
  try {
    localStorage.setItem(STORAGE_KEY, level)
  } catch {}
}

export function CookieConsent() {
  const t = useTranslations('cookieConsent')
  const [visible, setVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (!getStoredConsent()) {
      setVisible(true)
    }
  }, [])

  const acceptAll = () => {
    setStoredConsent('all')
    setVisible(false)
  }

  const declineNonEssential = () => {
    setStoredConsent('essential')
    setVisible(false)
  }

  const savePreferences = () => {
    const level: ConsentLevel =
      preferences.analytics && preferences.marketing
        ? 'all'
        : preferences.analytics || preferences.marketing
          ? 'custom'
          : 'essential'
    setStoredConsent(level)
    setVisible(false)
  }

  if (!visible) return null

  const message = t('message')
  const hasPreferencesPanel = Boolean(t.raw('preferencesTitle'))

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#1B3A6B] p-6 shadow-2xl border border-white/10">
        {showPreferences && hasPreferencesPanel ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">{t('preferencesTitle')}</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <label className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div>
                  <p className="font-semibold text-white">{t('essentialLabel')}</p>
                  <p className="text-sm text-slate-300">{t('essentialDescription')}</p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="h-4 w-4 rounded accent-[#C9A84C]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-white/5 p-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">{t('analyticsLabel')}</p>
                  <p className="text-sm text-slate-300">{t('analyticsDescription')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-[#C9A84C] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-white/5 p-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">{t('marketingLabel')}</p>
                  <p className="text-sm text-slate-300">{t('marketingDescription')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, marketing: e.target.checked }))
                  }
                  className="h-4 w-4 rounded accent-[#C9A84C] cursor-pointer"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={savePreferences}
                className="flex-1 rounded-full bg-[#C9A84C] px-6 py-3 font-bold text-[#1B3A6B] hover:bg-[#dfc07a] transition-colors"
              >
                {t('savePreferences')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-[#C9A84C] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-200 leading-relaxed">{message}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {hasPreferencesPanel && (
                <button
                  onClick={() => setShowPreferences(true)}
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  {t('managePreferences')}
                </button>
              )}
              <button
                onClick={declineNonEssential}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                {t('declineNonEssential')}
              </button>
              <button
                onClick={acceptAll}
                className="rounded-full bg-[#C9A84C] px-4 py-2 text-sm font-bold text-[#1B3A6B] hover:bg-[#dfc07a] transition-colors"
              >
                {t('acceptAll')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import type { Locale } from 'intl'
import { createIntl, createIntlCache } from 'intl'

const cache = createIntlCache()

export function createIntlInstance(locale: Locale) {
  return createIntl({
    locale,
    messages: {},
  }, cache)
}

export type { Locale }
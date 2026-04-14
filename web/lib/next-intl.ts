import type { Messages } from 'next-intl';

const messages: Messages = {
  // ... existing translations
  'gn': require('../public/locales/gn.json'),
};

export function getNextIntlMessages(localeCode: string): Messages {
  return messages[localeCode];
}
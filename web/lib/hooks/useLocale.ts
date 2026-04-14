import { useState, useEffect } from 'react';

export function useLocale() {
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale) {
      setLocale(storedLocale);
    }
  }, []);

  return locale;
}

Note: This implementation assumes you have already set up a Supabase instance and have the necessary environment variables configured. Additionally, you will need to create the `translations` table in your Supabase database and populate it with the necessary data.
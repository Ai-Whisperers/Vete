import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

interface LocaleSwitcherProps {
  locales: string[];
}

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({ locales }) => {
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale) {
      setSelectedLocale(storedLocale);
    } else {
      setSelectedLocale(router.locale);
    }
  }, [router.locale]);

  const handleLocaleChange = async (locale: string) => {
    setSelectedLocale(locale);
    localStorage.setItem('locale', locale);
    await router.push(router.asPath, undefined, { locale });
  };

  return (
    <div>
      <select value={selectedLocale} onChange={(e) => handleLocaleChange(e.target.value)}>
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {locale}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocaleSwitcher;
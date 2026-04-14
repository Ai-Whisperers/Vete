import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/hooks/useLocale';

export default function Hero() {
  const [translations, setTranslations] = useState<any[]>([]);
  const locale = useLocale();

  useEffect(() => {
    async function fetchTranslations() {
      const response = await fetch(`/api/locales?locale=${locale}`);
      const data = await response.json();
      setTranslations(data);
    }

    fetchTranslations();
  }, [locale]);

  return (
    <div>
      {translations.map((translation) => (
        <p key={translation.id}>{translation.text}</p>
      ))}
    </div>
  );
}
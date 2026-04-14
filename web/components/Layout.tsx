import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const Layout = ({ children }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [locale, setLocale] = useState(i18n.language);

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale');
    if (storedLocale) {
      setLocale(storedLocale);
    }
  }, []);

  const handleLocaleChange = (locale: string) => {
    setLocale(locale);
    localStorage.setItem('locale', locale);
    i18n.changeLanguage(locale);
    router.push(router.asPath, undefined, { locale });
  };

  return (
    <div>
      <header>
        <select value={locale} onChange={(e) => handleLocaleChange(e.target.value)}>
          <option value="en">English</option>
          <option value="gn">Guarani</option>
        </select>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
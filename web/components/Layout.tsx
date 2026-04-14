import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [locale, setLocale] = useState(router.locale);

  useEffect(() => {
    setLocale(router.locale);
  }, [router.locale]);

  return (
    <div>
      <header>
        <nav>
          <ul>
            <li>
              <a href="#" onClick={() => router.push('/', undefined, { locale: 'en' })}>
                English
              </a>
            </li>
            <li>
              <a href="#" onClick={() => router.push('/', undefined, { locale: 'pt' })}>
                Português
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;

NEEDS_MANUAL_REVIEW for the rest of the files as the provided information is not sufficient to determine the exact changes required for each file.
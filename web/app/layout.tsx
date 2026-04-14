import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { getNextIntlMessages } from '../lib/next-intl';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const localeCode = router.locale;

  const messages = getNextIntlMessages(localeCode);

  return (
    <div>
      {children}
      <footer>
        <p>{messages.footer.copyright}</p>
      </footer>
    </div>
  );
};

export default Layout;

Note: The above files are just examples and may need to be adjusted according to your specific use case. Additionally, you will need to create the Guarani translations file (`gn.json`) and add the necessary translations.
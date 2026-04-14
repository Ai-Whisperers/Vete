import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import LocaleSwitcher from '../components/LocaleSwitcher';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const locales = router.locales;

  return (
    <div>
      <LocaleSwitcher locales={locales} />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
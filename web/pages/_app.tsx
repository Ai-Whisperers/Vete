import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { register } from '../serviceWorkerRegistration';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    register();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
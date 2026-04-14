// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Remove server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentNode?.removeChild(jssStyles);
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
import type { AppProps } from 'next/app';
import { scheduleCleanup } from '../lib/data-retention';

function MyApp({ Component, pageProps }: AppProps) {
  // Schedule data retention on app startup
  scheduleCleanup();

  return <Component {...pageProps} />;
}

export default MyApp;
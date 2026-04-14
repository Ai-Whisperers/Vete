import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from '@supabase/auth-helpers-nextjs';
import { supabaseUrl, supabaseKey } from '../lib/constants';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider
      supabaseUrl={supabaseUrl}
      supabaseKey={supabaseKey}
      // Add other props if needed
    >
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
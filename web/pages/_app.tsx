import type { AppProps } from 'next/app';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useLangfuse } from '../lib/langfuse';

function MyApp({ Component, pageProps }: AppProps) {
  const supabaseClient = useSupabaseClient();
  const { startTrace, endTrace } = useLangfuse();

  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { fetcher } from '../lib/api';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 10000,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
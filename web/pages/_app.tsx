import type { AppProps } from 'next/app';
import Head from 'next/head';
import ApiVersionNotice from '../components/ApiVersionNotice';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>Vete</title>
      </Head>
      <ApiVersionNotice />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
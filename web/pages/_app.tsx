import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="
            default-src 'self';
            script-src 'self' https://cdn.jsdelivr.net https://cdn.skypack.dev;
            style-src 'self' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com;
            frame-src 'self' https://www.youtube.com;
            object-src 'none';
            upgrade-insecure-requests;
          "
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
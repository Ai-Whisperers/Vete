import type { AppProps } from 'next/app';
import RealUserMonitoring from '../components/RealUserMonitoring';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <RealUserMonitoring />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
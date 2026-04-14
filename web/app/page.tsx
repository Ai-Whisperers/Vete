import { logger } from '../lib/logger';

function MyApp({ Component, pageProps }) {
  logger.info('Page loaded');

  return <Component {...pageProps} />;
}

export default MyApp;
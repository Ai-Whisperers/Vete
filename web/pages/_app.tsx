import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Dashboard from '../components/Dashboard';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Dashboard />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

Note: The above code is a basic implementation of the tier status feature. You may need to modify it to fit your specific requirements and integrate it with your existing codebase. Additionally, you will need to create the necessary tables and data in your Supabase database to support this feature.
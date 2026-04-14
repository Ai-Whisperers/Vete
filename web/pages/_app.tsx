import '../styles/globals.css';
import type { AppProps } from 'next/app';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import ExportReports from '../components/ExportReports';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <AnalyticsDashboard />
      <ExportReports />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
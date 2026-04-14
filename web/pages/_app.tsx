import type { AppProps } from 'next/app';
import QRPayment from '../components/QRPayment';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <QRPayment amount={10.99} description="Test payment" />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

Note: You need to replace the `supabaseUrl`, `supabaseKey`, and `supabaseSecret` with your actual Supabase credentials. Also, this is a basic implementation and you may need to modify it according to your specific requirements.
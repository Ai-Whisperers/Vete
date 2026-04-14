import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
Note: Please replace the `supabaseUrl`, `supabaseKey`, and `supabaseSecret` with your actual Supabase credentials. Also, make sure to install the required dependencies, including `@supabase/supabase-js`.
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Vete</title>
      </Head>
      <h1>Welcome to Vete</h1>
      <p>Current locale: {router.locale}</p>
    </div>
  );
};

export default Home;
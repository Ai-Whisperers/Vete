import type { NextPage } from 'next';
import PromoCodeForm from '../components/PromoCodeForm';
import PromoCodeList from '../components/PromoCodeList';

const Home: NextPage = () => {
  return (
    <div>
      <h1>Promo Code Manager</h1>
      <PromoCodeForm />
      <PromoCodeList />
    </div>
  );
};

export default Home;
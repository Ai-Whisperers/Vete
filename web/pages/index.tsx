import type { NextPage } from 'next';
import DosageCalculator from '../components/DosageCalculator';

const Home: NextPage = () => {
  return (
    <div>
      <DosageCalculator petId={1} />
    </div>
  );
};

export default Home;
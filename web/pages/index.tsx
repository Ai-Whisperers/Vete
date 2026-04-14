import type { NextPage } from 'next';
import DataExport from '../components/DataExport';

const Home: NextPage = () => {
  const userId = 1; // Replace with actual user ID

  return (
    <div>
      <h1>Welcome to Vete</h1>
      <DataExport userId={userId} />
    </div>
  );
};

export default Home;
import type { NextPage } from 'next';
import SightingMap from '../components/SightingMap';

const Home: NextPage = () => {
  return (
    <div>
      <h1>Sighting Map</h1>
      <SightingMap />
    </div>
  );
};

export default Home;
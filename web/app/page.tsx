import type { NextPage } from 'next';
import MedicationDispensingWorkflow from '../components/MedicationDispensingWorkflow';

const Home: NextPage = () => {
  return (
    <div>
      <MedicationDispensingWorkflow prescriptionId={1} />
    </div>
  );
};

export default Home;
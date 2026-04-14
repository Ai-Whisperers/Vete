import { supabase } from '../lib/supabase';
import LostPetReportForm from '../components/LostPetReportForm';

const LostPetsPage = () => {
  const [petId, setPetId] = useState(0);

  const handlePetIdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPetId(parseInt(event.target.value, 10));
  };

  return (
    <div>
      <h1>Lost Pets</h1>
      <select onChange={handlePetIdChange}>
        <option value="0">Select a pet</option>
        {/* TODO: fetch pets from database and populate options */}
      </select>
      {petId > 0 && <LostPetReportForm petId={petId} />}
    </div>
  );
};

export default LostPetsPage;
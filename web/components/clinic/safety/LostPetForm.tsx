import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SafetyService } from '../../../lib/domain/verticals/clinic/safety/service';

const LostPetForm = () => {
  const supabase = useSupabaseClient();
  const safetyService = new SafetyService(supabase);
  const [petId, setPetId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const lostPet = await safetyService.reportLostPet({ pet_id: petId, location, description }, 'your-tenant-id');
      console.log(lostPet);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Pet ID:
        <input type="text" value={petId} onChange={(event) => setPetId(event.target.value)} />
      </label>
      <label>
        Location:
        <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} />
      </label>
      <label>
        Description:
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <button type="submit">Report Lost Pet</button>
    </form>
  );
};

export default LostPetForm;
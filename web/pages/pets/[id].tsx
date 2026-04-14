import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PetGrowthChart from '../components/PetGrowthChart';

const PetPage = ({ id }) => {
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, breed')
        .eq('id', id);
      if (data) {
        setPet(data[0]);
      } else {
        console.error(error);
      }
    };

    fetchPet();
  }, [id]);

  return (
    <div>
      {pet && (
        <div>
          <h1>{pet.name}</h1>
          <p>Breed: {pet.breed}</p>
          <PetGrowthChart />
        </div>
      )}
    </div>
  );
};

export default PetPage;
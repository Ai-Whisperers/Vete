import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdoptionListingForm from '../components/AdoptionListingForm';

const AdoptionListings = () => {
  const [petId, setPetId] = useState<number | null>(null);

  useEffect(() => {
    const getPetId = async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('id')
        .eq('id', 1); // Replace with actual pet ID
      if (error) {
        console.error(error);
      } else {
        setPetId(data[0].id);
      }
    };
    getPetId();
  }, []);

  return (
    <div>
      {petId && <AdoptionListingForm petId={petId} />}
    </div>
  );
};

export default AdoptionListings;
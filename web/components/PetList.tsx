import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pet } from '../types';

const PetList = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', supabase.auth.user()?.id);
      if (data) {
        setPets(data);
      } else {
        console.error(error);
      }
    };
    fetchPets();
  }, []);

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
  };

  return (
    <div>
      <h2>Pets</h2>
      <ul>
        {pets.map((pet) => (
          <li key={pet.id}>
            <button onClick={() => handlePetSelect(pet)}>
              {pet.name}
            </button>
          </li>
        ))}
      </ul>
      {selectedPet && (
        <div>
          <h3>Selected Pet: {selectedPet.name}</h3>
          <p>Medical History: {selectedPet.medical_history}</p>
        </div>
      )}
    </div>
  );
};

export default PetList;
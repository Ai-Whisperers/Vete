import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pet } from '../types';

const PetForm = () => {
  const [name, setName] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [ownerId, setOwnerId] = useState(supabase.auth.user()?.id);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { data, error } = await supabase
      .from('pets')
      .insert([{ name, medical_history: medicalHistory, owner_id: ownerId }]);
    if (data) {
      console.log('Pet created successfully');
    } else {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <br />
      <label>
        Medical History:
        <textarea value={medicalHistory} onChange={(event) => setMedicalHistory(event.target.value)} />
      </label>
      <br />
      <button type="submit">Create Pet</button>
    </form>
  );
};

export default PetForm;
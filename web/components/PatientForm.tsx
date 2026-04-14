import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Patient } from '../types/Patient';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (patient: Patient) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSubmit }) => {
  const [name, setName] = useState(patient?.name || '');
  const [species, setSpecies] = useState(patient?.species || '');
  const [breed, setBreed] = useState(patient?.breed || '');
  const [age, setAge] = useState(patient?.age || '');
  const [owner, setOwner] = useState(patient?.owner || '');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const newPatient: Patient = {
        name,
        species,
        breed,
        age,
        owner,
      };
      if (patient) {
        await supabase.from('patients').update([newPatient]);
      } else {
        await supabase.from('patients').insert([newPatient]);
      }
      onSubmit(newPatient);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Species:
        <input type="text" value={species} onChange={(event) => setSpecies(event.target.value)} />
      </label>
      <label>
        Breed:
        <input type="text" value={breed} onChange={(event) => setBreed(event.target.value)} />
      </label>
      <label>
        Age:
        <input type="text" value={age} onChange={(event) => setAge(event.target.value)} />
      </label>
      <label>
        Owner:
        <input type="text" value={owner} onChange={(event) => setOwner(event.target.value)} />
      </label>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Submit</button>
    </form>
  );
};

export default PatientForm;
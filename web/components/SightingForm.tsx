import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface SightingFormProps {
  petId: number;
}

const SightingForm: React.FC<SightingFormProps> = ({ petId }) => {
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const { data, error } = await supabase
        .from('sightings')
        .insert([
          {
            pet_id: petId,
            location,
            photo,
            description,
          },
        ]);

      if (error) {
        throw error;
      }

      toast.success('Sighting reported successfully!');
      router.push('/pets');
    } catch (error) {
      console.error(error);
      toast.error('Error reporting sighting');
    }
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoto(event.target.files[0]);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Location:
        <input type="text" value={location} onChange={handleLocationChange} />
      </label>
      <label>
        Photo:
        <input type="file" onChange={handlePhotoChange} />
      </label>
      <label>
        Description:
        <textarea value={description} onChange={handleDescriptionChange} />
      </label>
      <button type="submit">Report Sighting</button>
    </form>
  );
};

export default SightingForm;
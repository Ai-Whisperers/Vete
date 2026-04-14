import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

interface LostPetReportFormProps {
  petId: number;
}

const LostPetReportForm: React.FC<LostPetReportFormProps> = ({ petId }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [contactInformation, setContactInformation] = useState('');
  const router = useRouter();

  const handleReportLostPet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!photo || !lastSeenLocation || !contactInformation) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lost_pets')
        .insert([
          {
            pet_id: petId,
            photo: photo,
            last_seen_location: lastSeenLocation,
            contact_information: contactInformation,
          },
        ]);

      if (error) {
        throw error;
      }

      router.push('/lost-pets');
    } catch (error) {
      console.error(error);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPhoto(event.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleReportLostPet}>
      <label>
        Photo:
        <input type="file" onChange={handlePhotoChange} />
      </label>
      <br />
      <label>
        Last seen location:
        <input
          type="text"
          value={lastSeenLocation}
          onChange={(event) => setLastSeenLocation(event.target.value)}
        />
      </label>
      <br />
      <label>
        Contact information:
        <input
          type="text"
          value={contactInformation}
          onChange={(event) => setContactInformation(event.target.value)}
        />
      </label>
      <br />
      <button type="submit">Report lost pet</button>
    </form>
  );
};

export default LostPetReportForm;
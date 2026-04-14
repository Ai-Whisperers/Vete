import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

interface AdoptionListingFormProps {
  petId: number;
}

const AdoptionListingForm: React.FC<AdoptionListingFormProps> = ({ petId }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [petDetails, setPetDetails] = useState({
    name: '',
    breed: '',
    age: '',
    description: '',
  });
  const [status, setStatus] = useState('available');
  const [featured, setFeatured] = useState(false);
  const router = useRouter();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handlePetDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPetDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value;
    setStatus(status);
  };

  const handleFeaturedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const featured = event.target.checked;
    setFeatured(featured);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { data, error } = await supabase
        .from('adoption_listings')
        .insert([
          {
            pet_id: petId,
            photo: photo,
            pet_details: petDetails,
            status: status,
            featured: featured,
          },
        ]);
      if (error) {
        console.error(error);
      } else {
        router.push('/adoption-listings');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Photo:
        <input type="file" onChange={handlePhotoUpload} />
      </label>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={petDetails.name}
          onChange={handlePetDetailsChange}
        />
      </label>
      <label>
        Breed:
        <input
          type="text"
          name="breed"
          value={petDetails.breed}
          onChange={handlePetDetailsChange}
        />
      </label>
      <label>
        Age:
        <input
          type="text"
          name="age"
          value={petDetails.age}
          onChange={handlePetDetailsChange}
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          value={petDetails.description}
          onChange={handlePetDetailsChange}
        />
      </label>
      <label>
        Status:
        <select value={status} onChange={handleStatusChange}>
          <option value="available">Available</option>
          <option value="adopted">Adopted</option>
          <option value="pending">Pending</option>
        </select>
      </label>
      <label>
        Featured:
        <input type="checkbox" checked={featured} onChange={handleFeaturedChange} />
      </label>
      <button type="submit">Create Adoption Listing</button>
    </form>
  );
};

export default AdoptionListingForm;
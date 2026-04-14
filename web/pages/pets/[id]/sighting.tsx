import { GetServerSideProps } from 'next';
import { supabase } from '../../lib/supabase';
import SightingForm from '../../components/SightingForm';
import LocationPicker from '../../components/LocationPicker';
import PhotoUpload from '../../components/PhotoUpload';

interface PetSightingPageProps {
  petId: number;
}

const PetSightingPage: React.FC<PetSightingPageProps> = ({ petId }) => {
  return (
    <div>
      <h1>Report a Sighting</h1>
      <SightingForm petId={petId} />
      <LocationPicker onLocationChange={(location) => console.log(location)} />
      <PhotoUpload onPhotoChange={(photo) => console.log(photo)} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  return {
    props: {
      petId: parseInt(id as string),
    },
  };
};

export default PetSightingPage;
import { GetServerSideProps } from 'next';
import { supabase } from '../lib/supabase';
import { Pet } from '../types/Pet';
import HealthTimeline from '../components/HealthTimeline';

interface PetPageProps {
  pet: Pet;
}

const PetPage: React.FC<PetPageProps> = ({ pet }) => {
  return (
    <div>
      <h1>{pet.name}</h1>
      <HealthTimeline petId={pet.id} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;
  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id);
  if (error) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      pet: data[0],
    },
  };
};

export default PetPage;
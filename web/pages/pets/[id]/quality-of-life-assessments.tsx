import { GetServerSideProps } from 'next';
import { supabase } from '../lib/supabase';
import { Pet } from '../types/Pet';
import QualityOfLifeAssessment from '../components/QualityOfLifeAssessment';

interface Props {
  pet: Pet;
}

const QualityOfLifeAssessments: React.FC<Props> = ({ pet }) => {
  return (
    <div>
      <h1>Quality of Life Assessments for {pet.name}</h1>
      <QualityOfLifeAssessment pet={pet} />
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

export default QualityOfLifeAssessments;
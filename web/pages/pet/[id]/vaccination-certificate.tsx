import { GetServerSideProps } from 'next';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import VaccinationCertificate from '../../components/VaccinationCertificate';

interface PetVaccinationCertificateProps {
  petId: number;
}

const PetVaccinationCertificate: React.FC<PetVaccinationCertificateProps> = ({ petId }) => {
  return (
    <div>
      <VaccinationCertificate petId={petId} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const petId = parseInt(params.id as string);
  return {
    props: {
      petId,
    },
  };
};

export default PetVaccinationCertificate;
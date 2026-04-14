import AdoptionApplicationForm from '../components/AdoptionApplicationForm';

const AdoptionApplicationPage = () => {
  const petId = 1; // Replace with actual pet ID

  return (
    <div>
      <h1>Adoption Application Form</h1>
      <AdoptionApplicationForm petId={petId} />
    </div>
  );
};

export default AdoptionApplicationPage;
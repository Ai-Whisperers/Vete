import ClaimForm from '../components/ClaimForm';
import ClaimStatus from '../components/ClaimStatus';

const ClaimsPage = () => {
  return (
    <div>
      <h1>Claims</h1>
      <ClaimForm />
      <ClaimStatus claimId={1} />
    </div>
  );
};

export default ClaimsPage;
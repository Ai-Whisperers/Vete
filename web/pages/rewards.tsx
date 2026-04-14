import RewardsCatalog from '../components/RewardsCatalog';
import RedeemPointsForm from '../components/RedeemPointsForm';
import RedemptionConfirmation from '../components/RedemptionConfirmation';

const RewardsPage = () => {
  return (
    <div>
      <RewardsCatalog />
      <RedeemPointsForm rewardId={1} />
      <RedemptionConfirmation redemptionId={1} />
    </div>
  );
};

export default RewardsPage;
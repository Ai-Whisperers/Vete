import React, { useEffect } from 'react';
import useRewardStore from '@/lib/store/rewards';
import RewardCard from '@/components/RewardCard';

const RewardsPage = () => {
  const { rewards, getRewards } = useRewardStore();

  useEffect(() => {
    getRewards();
  }, []);

  return (
    <div>
      <h1>Rewards</h1>
      {rewards.map((reward) => (
        <RewardCard key={reward.id} reward={reward} />
      ))}
    </div>
  );
};

export default RewardsPage;
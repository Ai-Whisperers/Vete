import React from 'react';
import { Reward } from '@/lib/domain/rewards/types';

interface Props {
  reward: Reward;
}

const RewardCard: React.FC<Props> = ({ reward }) => {
  return (
    <div>
      <h2>{reward.name}</h2>
      <p>{reward.description}</p>
      <p>Points required: {reward.points_required}</p>
    </div>
  );
};

export default RewardCard;

### Pages
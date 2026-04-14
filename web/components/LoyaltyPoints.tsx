import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LoyaltyPointsProps {
  userId: number;
}

const LoyaltyPoints: React.FC<LoyaltyPointsProps> = ({ userId }) => {
  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [tierStatus, setTierStatus] = useState('');
  const [availableRewards, setAvailableRewards] = useState([]);

  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('balance, history, tier_status, available_rewards')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
      } else {
        setPointsBalance(data[0].balance);
        setPointsHistory(data[0].history);
        setTierStatus(data[0].tier_status);
        setAvailableRewards(data[0].available_rewards);
      }
    };

    fetchLoyaltyPoints();
  }, [userId]);

  return (
    <div>
      <h2>Loyalty Points</h2>
      <p>Points Balance: {pointsBalance}</p>
      <h3>Points History</h3>
      <ul>
        {pointsHistory.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
      <p>Tier Status: {tierStatus}</p>
      <h3>Available Rewards</h3>
      <ul>
        {availableRewards.map((reward, index) => (
          <li key={index}>{reward}</li>
        ))}
      </ul>
    </div>
  );
};

export default LoyaltyPoints;
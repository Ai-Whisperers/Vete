import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Reward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
}

const RewardsCatalog = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name, description, points_required');
      if (error) {
        console.error(error);
      } else {
        setRewards(data);
      }
      setLoading(false);
    };
    fetchRewards();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Rewards Catalog</h1>
      <ul>
        {rewards.map((reward) => (
          <li key={reward.id}>
            <h2>{reward.name}</h2>
            <p>{reward.description}</p>
            <p>Points required: {reward.pointsRequired}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RewardsCatalog;
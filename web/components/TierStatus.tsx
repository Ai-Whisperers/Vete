import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Tier {
  id: number;
  name: string;
  benefits: string[];
}

interface TierStatusProps {
  userId: number;
}

const TierStatus: React.FC<TierStatusProps> = ({ userId }) => {
  const [tier, setTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateTier = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('tier_id')
        .eq('id', userId);

      if (error) {
        console.error(error);
        return;
      }

      const tierId = data[0].tier_id;
      const { data: tierData, error: tierError } = await supabase
        .from('tiers')
        .select('*')
        .eq('id', tierId);

      if (tierError) {
        console.error(tierError);
        return;
      }

      setTier(tierData[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateTier();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tier) {
    return <div>No tier data available</div>;
  }

  return (
    <div>
      <h2>Tier Status: {tier.name}</h2>
      <ul>
        {tier.benefits.map((benefit, index) => (
          <li key={index}>{benefit}</li>
        ))}
      </ul>
    </div>
  );
};

export default TierStatus;
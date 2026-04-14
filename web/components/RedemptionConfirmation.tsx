import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RedemptionConfirmationProps {
  redemptionId: number;
}

const RedemptionConfirmation = ({ redemptionId }: RedemptionConfirmationProps) => {
  const [redemption, setRedemption] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRedemption = async () => {
      const { data, error } = await supabase
        .from('redemptions')
        .select('*')
        .eq('id', redemptionId);
      if (error) {
        console.error(error);
      } else {
        setRedemption(data[0]);
      }
      setLoading(false);
    };
    fetchRedemption();
  }, [redemptionId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Redemption Confirmation</h1>
      <p>Redemption ID: {redemption.id}</p>
      <p>Reward: {redemption.reward.name}</p>
      <p>Points redeemed: {redemption.points}</p>
    </div>
  );
};

export default RedemptionConfirmation;
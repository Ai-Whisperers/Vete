import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface RedeemPointsFormProps {
  rewardId: number;
}

const RedeemPointsForm = ({ rewardId }: RedeemPointsFormProps) => {
  const [points, setPoints] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .insert([{ reward_id: rewardId, points }]);
      if (error) {
        setError(error.message);
      } else {
        setError(null);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Points to redeem:
        <input
          type="number"
          value={points}
          onChange={(event) => setPoints(Number(event.target.value))}
        />
      </label>
      <button type="submit">Redeem</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default RedeemPointsForm;
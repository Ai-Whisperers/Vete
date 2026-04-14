import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LoyaltyPointsProps {
  userId: number;
}

const LoyaltyPoints: React.FC<LoyaltyPointsProps> = ({ userId }) => {
  const [points, setPoints] = useState(0);
  const [pointsHistory, setPointsHistory] = useState([]);

  useEffect(() => {
    const fetchPoints = async () => {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
      } else {
        setPoints(data[0].points);
      }
    };

    const fetchPointsHistory = async () => {
      const { data, error } = await supabase
        .from('loyalty_points_history')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error(error);
      } else {
        setPointsHistory(data);
      }
    };

    fetchPoints();
    fetchPointsHistory();
  }, [userId]);

  const awardPoints = async (amount: number) => {
    const { data, error } = await supabase
      .from('loyalty_points')
      .update({ id: userId, points: points + amount });

    if (error) {
      console.error(error);
    } else {
      setPoints(points + amount);
    }
  };

  const expirePoints = async (amount: number) => {
    const { data, error } = await supabase
      .from('loyalty_points')
      .update({ id: userId, points: points - amount });

    if (error) {
      console.error(error);
    } else {
      setPoints(points - amount);
    }
  };

  return (
    <div>
      <h2>Loyalty Points: {points}</h2>
      <button onClick={() => awardPoints(10)}>Award 10 points</button>
      <button onClick={() => expirePoints(5)}>Expire 5 points</button>
      <h2>Points History:</h2>
      <ul>
        {pointsHistory.map((point) => (
          <li key={point.id}>
            {point.amount} points {point.type} on {point.date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoyaltyPoints;
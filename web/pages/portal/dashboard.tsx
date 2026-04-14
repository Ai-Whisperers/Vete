import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import LoyaltyPoints from '../components/LoyaltyPoints';

const Dashboard = () => {
  const [userId, setUserId] = useState(0);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error(error);
      } else {
        setUserId(data.user_id);
      }
    };

    fetchUserId();
  }, []);

  return (
    <div>
      <h1>Portal Dashboard</h1>
      {userId && <LoyaltyPoints userId={userId} />}
    </div>
  );
};

export default Dashboard;
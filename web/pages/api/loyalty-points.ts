import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

const loyaltyPoints = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, amount } = req.body;

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('loyalty_points')
      .update({ id: userId, points: amount });

    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error awarding points' });
    } else {
      res.status(200).json({ message: 'Points awarded successfully' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default loyaltyPoints;
import { NextApiRequest, NextApiResponse } from 'next';
import { useSupabaseClient } from '@supabase/supabase-js';

const supabase = useSupabaseClient();

const sendNotification = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { message, subscription } = req.body;
    const response = await supabase.from('notification_queue').insert([{
      message,
      subscription,
    }]);
    res.status(201).json(response.data);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default sendNotification;
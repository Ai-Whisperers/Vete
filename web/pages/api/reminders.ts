import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

const remindersApi = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { reminderType, reminderTime, appointmentId } = req.body;
    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          appointmentId,
          reminderType,
          reminderTime,
        },
      ]);
    if (error) {
      res.status(500).json({ error: 'Failed to create reminder' });
    } else {
      res.status(201).json(data[0]);
    }
  } else if (req.method === 'GET') {
    const { appointmentId } = req.query;
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('appointmentId', appointmentId);
    if (error) {
      res.status(500).json({ error: 'Failed to fetch reminders' });
    } else {
      res.status(200).json(data);
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default remindersApi;
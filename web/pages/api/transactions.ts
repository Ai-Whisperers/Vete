import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

const transactionsApi = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { amount, paymentMethod } = req.body;
    const transaction = {
      amount,
      paymentMethod,
      status: 'pending',
    };

    try {
      const { data, error } = await supabase.from('transactions').insert([transaction]);
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating transaction' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default transactionsApi;
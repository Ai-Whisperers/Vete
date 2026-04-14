import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;
const tigoMoneyApiKey = process.env.TIGO_MONEY_API_KEY;
const tigoMoneyApiSecret = process.env.TIGO_MONEY_API_SECRET;

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

const payment = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, description } = req.body;

  try {
    const tigoMoneyResponse = await axios.post('https://api.tigo.money/payment', {
      amount,
      description,
      apiKey: tigoMoneyApiKey,
      apiSecret: tigoMoneyApiSecret,
    });

    const paymentId = tigoMoneyResponse.data.paymentId;
    const paymentStatus = tigoMoneyResponse.data.status;

    if (paymentStatus === 'success') {
      await supabase.from('payments').insert({
        amount,
        description,
        paymentId,
        status: 'success',
      });

      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

export default payment;
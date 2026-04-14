import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

const createDrugDosage = async (req: NextApiRequest, res: NextApiResponse) => {
  const { drugId, dosage } = req.body;

  const { data, error } = await supabase
    .from('drug_dosages')
    .insert({ drug_id: drugId, dosage });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return createDrugDosage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
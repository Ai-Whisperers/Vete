import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

const getDrugInteractions = async (req: NextApiRequest, res: NextApiResponse) => {
  const { selectedDrugs } = req.body;

  const { data, error } = await supabase
    .from('drug_interactions')
    .select('*')
    .or(`drug1.id.in(${selectedDrugs.map((drug) => drug.id).join(',')})`)
    .or(`drug2.id.in(${selectedDrugs.map((drug) => drug.id).join(',')})`);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      return getDrugInteractions(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
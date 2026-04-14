import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

const getDentalChart = async (petId: number) => {
  const { data, error } = await supabase
    .from('dental_charts')
    .select('id, condition, procedure')
    .eq('pet_id', petId)

  if (error) {
    throw error
  }

  return data
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const petId = parseInt(req.query.petId as string, 10)
    const dentalChart = await getDentalChart(petId)
    return res.status(200).json({ teeth: dentalChart })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
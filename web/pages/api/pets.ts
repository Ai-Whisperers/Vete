import { NextApiRequest, NextApiResponse } from 'next';
import { getPets } from '../lib/db';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const pets = await getPets();
    res.status(200).json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pets' });
  }
};

export default handler;
import { NextApiRequest, NextApiResponse } from 'next';
import { getPetAppointments } from '../../lib/db';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const petId = parseInt(req.query.id as string);
    const appointments = await getPetAppointments(petId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pet appointments' });
  }
};

export default handler;
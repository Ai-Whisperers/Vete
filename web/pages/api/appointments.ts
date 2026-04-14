import { NextApiRequest, NextApiResponse } from 'next';
import { getAppointments } from '../lib/db';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const appointments = await getAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

export default handler;
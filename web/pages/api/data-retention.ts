import { NextApiRequest, NextApiResponse } from 'next';
import { scheduleCleanup } from '../../lib/data-retention';

const dataRetentionApi = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      await scheduleCleanup();
      res.status(200).json({ message: 'Data retention scheduled' });
    } catch (error) {
      console.error(`Error scheduling data retention: ${error.message}`);
      res.status(500).json({ message: 'Error scheduling data retention' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default dataRetentionApi;
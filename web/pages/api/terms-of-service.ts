import { NextApiRequest, NextApiResponse } from 'next';
import { getTermsOfService } from '../../lib/api';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const data = await getTermsOfService(req, res);
    res.json(data);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
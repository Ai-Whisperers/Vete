import { NextApiRequest, NextApiResponse } from 'next';
import { getPrivacyPolicy } from '../../lib/api';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const data = await getPrivacyPolicy(req, res);
    res.json(data);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
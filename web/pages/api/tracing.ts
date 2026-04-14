import type { NextApiRequest, NextApiResponse } from 'next';
import { useLangfuse } from '../../lib/langfuse';

const tracingApi = async (req: NextApiRequest, res: NextApiResponse) => {
  const { startTrace, endTrace } = useLangfuse();

  if (req.method === 'POST') {
    const traceId = await startTrace();
    res.status(201).json({ traceId });
  } else if (req.method === 'PUT') {
    const { traceId } = req.body;
    await endTrace(traceId);
    res.status(200).json({ message: 'Trace ended' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default tracingApi;
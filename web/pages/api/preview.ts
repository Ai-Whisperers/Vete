// pages/api/preview.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createPreviewDeployment, cleanupPreviewDeployment } from '../lib/deploy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { prId } = req.body;

    try {
      const previewUrl = await createPreviewDeployment(prId);
      res.status(201).json({ previewUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create preview deployment' });
    }
  } else if (req.method === 'DELETE') {
    const { prId } = req.body;

    try {
      await cleanupPreviewDeployment(prId);
      res.status(204).json({});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to cleanup preview deployment' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
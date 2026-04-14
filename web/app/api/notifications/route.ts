import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/domain/notifications/service';

const notificationService = new NotificationService(createClient());

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { type, recipientId, tenantId, title, message, channels } = req.body;

    const payload = {
      type,
      recipientId,
      recipientType: 'owner',
      tenantId,
      title,
      message,
      channels,
    };

    const result = await notificationService.sendNotification(payload);

    return res.status(201).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
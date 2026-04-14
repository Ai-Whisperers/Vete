import { createClient } from '@/lib/supabase/server';
import { NotificationPayload, NotificationResult } from './types';
import { NotificationRepository } from './repository';

export class NotificationService {
  private repository: NotificationRepository;

  constructor(supabase: ReturnType<typeof createClient>) {
    this.repository = new NotificationRepository(supabase);
  }

  async sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
    return this.repository.sendNotification(payload);
  }

  async getInAppNotifications(userId: string, tenantId: string): Promise<InAppNotification[]> {
    return this.repository.getInAppNotifications(userId, tenantId);
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    return this.repository.markNotificationAsRead(notificationId);
  }
}
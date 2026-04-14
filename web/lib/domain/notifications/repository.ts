import { createClient } from '@/lib/supabase/server';
import { NotificationPayload, InAppNotification } from './types';

export class NotificationRepository {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  async sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert([payload])
      .select('id, type, title, message, channels, priority, action_url, data')
      .single();

    if (error || !data) {
      return { success: false, channels: [], errors: [error?.message] };
    }

    return { success: true, channels: [{ channel: 'email', success: true }] };
  }

  async getInAppNotifications(userId: string, tenantId: string): Promise<InAppNotification[]> {
    const { data, error } = await this.supabase
      .from('in_app_notifications')
      .select('id, type, title, message, action_url, read, created_at')
      .eq('recipient_id', userId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data;
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('in_app_notifications')
      .update({ id: notificationId, read: true })
      .select('id')
      .single();

    return error ? false : true;
  }
}
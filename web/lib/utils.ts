import { supabaseClient } from './supabase';

export async function logAuditEvent(eventType: string, eventData: any) {
  const { data, error } = await supabaseClient.from('audit_logs').insert([
    {
      event_type: eventType,
      event_data: JSON.stringify(eventData),
    },
  ]);

  if (error) {
    console.error('Error logging audit event:', error);
  }

  return data;
}
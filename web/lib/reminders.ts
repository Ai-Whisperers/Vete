import { supabaseClient } from './supabase';
import { sendSms, sendWhatsApp, sendEmail } from './notifications';

interface Reminder {
  id: number;
  appointmentId: number;
  clientId: number;
  timing: string;
  channel: string;
  confirmed: boolean;
  cancelled: boolean;
}

const getReminders = async () => {
  const { data, error } = await supabaseClient.from('reminders').select('*');
  if (error) {
    throw error;
  }
  return data as Reminder[];
};

const sendReminder = async (reminder: Reminder) => {
  switch (reminder.channel) {
    case 'sms':
      await sendSms(reminder.clientId, reminder.appointmentId);
      break;
    case 'whatsapp':
      await sendWhatsApp(reminder.clientId, reminder.appointmentId);
      break;
    case 'email':
      await sendEmail(reminder.clientId, reminder.appointmentId);
      break;
    default:
      throw new Error(`Unsupported channel: ${reminder.channel}`);
  }
};

const updateReminder = async (reminder: Reminder) => {
  const { data, error } = await supabaseClient
    .from('reminders')
    .update({ id: reminder.id, confirmed: reminder.confirmed, cancelled: reminder.cancelled });
  if (error) {
    throw error;
  }
  return data as Reminder;
};

const cancelReminder = async (reminder: Reminder) => {
  const updatedReminder = await updateReminder({ ...reminder, cancelled: true });
  return updatedReminder;
};

export { getReminders, sendReminder, updateReminder, cancelReminder };
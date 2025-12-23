import { getReminderPreference } from './user-preferences';
import { sendReminderNotification } from './notification-service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: string;
  userId: string;
  startTime: string; // ISO string
  petName: string;
  reason: string;
  // Add other necessary appointment details
}

interface ReminderPreference {
  type: 'email' | 'sms';
  timeBefore: string;
}

function calculateReminderTime(appointmentTime: Date, preference: ReminderPreference): Date | null {
  const timeValue = parseInt(preference.timeBefore.slice(0, -1));
  const timeUnit = preference.timeBefore.slice(-1);
  let reminderTime: Date;

  if (timeUnit === 'h') {
    reminderTime = new Date(appointmentTime.getTime() - timeValue * 3600 * 1000);
  } else if (timeUnit === 'm') {
    reminderTime = new Date(appointmentTime.getTime() - timeValue * 60 * 1000);
  } else {
    console.warn(`Unsupported time unit: ${preference.timeBefore}.`);
    return null;
  }
  return reminderTime;
}

export async function checkAndSendReminders(
  appointments: Appointment[],
): Promise<void> {
  console.log('Checking and sending reminders...');

  const now = new Date();

  for (const appointment of appointments) {
    const userPreference = await getReminderPreference(appointment.userId);

    if (!userPreference) {
      console.log(`No reminder preference found for user ${appointment.userId}. Skipping.`);
      continue;
    }

    const appointmentTime = new Date(appointment.startTime);
    const reminderTime = calculateReminderTime(appointmentTime, userPreference);

    if (!reminderTime) {
      continue;
    }

    // Check if it's time to send the reminder
    if (now >= reminderTime && now < appointmentTime) {
      const formattedAppointmentTime = format(appointmentTime, 'EEEE, d MMMM yyyy HH:mm', { locale: es });
      const message = `Recordatorio: Tienes una cita para ${appointment.petName} (${appointment.reason}) el ${formattedAppointmentTime}.`;

      // In a real app, 'to' would be fetched from user details
      const userContact = 'user_contact_placeholder@example.com'; // Placeholder

      await sendReminderNotification({
        to: userContact,
        type: userPreference.type,
        message: message,
      });
      console.log(`Reminder sent for appointment ${appointment.id} to user ${appointment.userId}`);
    }
  }
}
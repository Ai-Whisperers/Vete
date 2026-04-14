import { sendNotification } from './service';
import { NotificationPayload } from './types';

export async function sendAppointmentReminder(options: {
  userId: string;
  tenantId: string;
  appointmentId: string;
  petName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicName?: string;
  channels?: ('email' | 'in_app' | 'push')[];
}) {
  const payload: NotificationPayload = {
    type: 'appointment_reminder',
    recipientId: options.userId,
    recipientType: 'owner',
    tenantId: options.tenantId,
    title: `Recordatorio de Cita para ${options.petName}`,
    message: `Tienes una cita programada para ${options.petName} el ${options.appointmentDate} a las ${options.appointmentTime}.`,
    channels: options.channels || ['email', 'in_app'],
    priority: 'normal',
    actionUrl: `/portal/appointments/${options.appointmentId}`,
    data: {
      appointmentId: options.appointmentId,
      petName: options.petName,
      date: options.appointmentDate,
      time: options.appointmentTime,
      clinicName: options.clinicName,
    },
  };

  return sendNotification(payload);
}
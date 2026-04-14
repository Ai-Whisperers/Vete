import React from 'react';

interface ReminderCardProps {
  reminder: {
    id: number;
    appointmentId: number;
    clientId: number;
    timing: string;
    channel: string;
    confirmed: boolean;
    cancelled: boolean;
  };
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder }) => {
  return (
    <div>
      <h2>Reminder {reminder.id}</h2>
      <p>Appointment ID: {reminder.appointmentId}</p>
      <p>Client ID: {reminder.clientId}</p>
      <p>Timing: {reminder.timing}</p>
      <p>Channel: {reminder.channel}</p>
      <p>Confirmed: {reminder.confirmed ? 'Yes' : 'No'}</p>
      <p>Cancelled: {reminder.cancelled ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default ReminderCard;

NEEDS_MANUAL_REVIEW for further implementation details and integration with existing codebase.
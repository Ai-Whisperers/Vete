import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Reminder {
  id: number;
  appointmentId: number;
  reminderType: string;
  reminderTime: string;
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderType, setReminderType] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    const fetchReminders = async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*');
      if (error) {
        console.error(error);
      } else {
        setReminders(data);
      }
    };
    fetchReminders();
  }, []);

  const handleSaveReminder = async () => {
    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          appointmentId: 1,
          reminderType,
          reminderTime,
        },
      ]);
    if (error) {
      console.error(error);
    } else {
      setReminders([...reminders, data[0]]);
    }
  };

  return (
    <div>
      <h1>Reminders</h1>
      <ul>
        {reminders.map((reminder) => (
          <li key={reminder.id}>
            {reminder.reminderType} at {reminder.reminderTime}
          </li>
        ))}
      </ul>
      <form>
        <label>
          Reminder Type:
          <select value={reminderType} onChange={(e) => setReminderType(e.target.value)}>
            <option value="">Select</option>
            <option value="SMS">SMS</option>
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </label>
        <label>
          Reminder Time:
          <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
        </label>
        <button type="button" onClick={handleSaveReminder}>
          Save Reminder
        </button>
      </form>
    </div>
  );
};

export default Reminders;
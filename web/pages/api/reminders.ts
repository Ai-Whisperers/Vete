import { NextApiRequest, NextApiResponse } from 'next';
import { getReminders, sendReminder, updateReminder, cancelReminder } from '../../lib/reminders';

const remindersApi = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'GET':
      const reminders = await getReminders();
      return res.json(reminders);
    case 'POST':
      const reminder = req.body;
      await sendReminder(reminder);
      return res.json({ message: 'Reminder sent successfully' });
    case 'PUT':
      const updatedReminder = await updateReminder(req.body);
      return res.json(updatedReminder);
    case 'DELETE':
      const cancelledReminder = await cancelReminder(req.body);
      return res.json(cancelledReminder);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default remindersApi;
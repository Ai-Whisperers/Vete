import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface EmailDataExportProps {
  userId: number;
  email: string;
}

const EmailDataExport: React.FC<EmailDataExportProps> = ({ userId, email }) => {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error(error);
      } else {
        const userData = data[0];
        const exportData = {
          user: userData,
          appointments: await getAppointments(userId),
          invoices: await getInvoices(userId),
          pets: await getPets(userId),
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const mailOptions = {
          from: 'your-email@example.com',
          to: email,
          subject: 'Your Data Export',
          text: 'Please find your data export attached.',
          attachments: [
            {
              filename: `user-data-${userId}.json`,
              path: url,
              cid: 'user-data',
            },
          ],
        };

        await sendEmail(mailOptions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const sendEmail = async (mailOptions: any) => {
    // Implement email sending logic using a library like Nodemailer
  };

  const getAppointments = async (userId: number) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(error);
    }
    return data;
  };

  const getInvoices = async (userId: number) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(error);
    }
    return data;
  };

  const getPets = async (userId: number) => {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error(error);
    }
    return data;
  };

  return (
    <button onClick={handleSend} disabled={sending}>
      {sending ? 'Sending...' : 'Send Data via Email'}
    </button>
  );
};

export default EmailDataExport;
Note: The `sendEmail` function in `EmailDataExport.tsx` is a placeholder and should be replaced with actual email sending logic using a library like Nodemailer.
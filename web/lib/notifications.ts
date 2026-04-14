import { supabaseClient } from './supabase';

const sendSms = async (clientId: number, appointmentId: number) => {
  // Implement SMS sending logic using a third-party service
  // For example, using Twilio
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  const message = await client.messages
    .create({
      body: `Reminder: You have an appointment scheduled for ${appointmentId}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: (await supabaseClient.from('clients').select('phone').eq('id', clientId)).data[0].phone,
    })
    .then((message) => message.sid);
  return message;
};

const sendWhatsApp = async (clientId: number, appointmentId: number) => {
  // Implement WhatsApp sending logic using a third-party service
  // For example, using Twilio
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  const message = await client.messages
    .create({
      body: `Reminder: You have an appointment scheduled for ${appointmentId}`,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: (await supabaseClient.from('clients').select('phone').eq('id', clientId)).data[0].phone,
    })
    .then((message) => message.sid);
  return message;
};

const sendEmail = async (clientId: number, appointmentId: number) => {
  // Implement email sending logic using a third-party service
  // For example, using Sendgrid
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: (await supabaseClient.from('clients').select('email').eq('id', clientId)).data[0].email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Reminder: Upcoming Appointment',
    text: `Reminder: You have an appointment scheduled for ${appointmentId}`,
    html: `<strong>Reminder: You have an appointment scheduled for ${appointmentId}</strong>`,
  };
  const response = await sgMail.send(msg);
  return response;
};

export { sendSms, sendWhatsApp, sendEmail };
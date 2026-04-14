import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../lib/supabase';

const whatsappMessages = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { message, conversationId, templateId, attachment } = req.body;

    const { data, error } = await supabaseClient
      .from('whatsapp_messages')
      .insert([
        {
          conversation_id: conversationId,
          message,
          template_id: templateId,
          attachment: attachment ? await uploadAttachment(attachment) : null,
        },
      ]);

    if (error) {
      return res.status(500).json({ error: 'Failed to send message' });
    }

    return res.status(201).json({ message: 'Message sent successfully' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

const uploadAttachment = async (file: any) => {
  const { data, error } = await supabaseClient.storage.from('whatsapp-attachments').upload(file.name, file);
  if (error) {
    console.error(error);
  }
  return data.Key;
};

export default whatsappMessages;
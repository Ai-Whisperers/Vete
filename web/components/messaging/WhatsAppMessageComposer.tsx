import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { WhatsAppMessageTemplate } from '../types';

interface WhatsAppMessageComposerProps {
  conversationId: string;
  onMessageSent: () => void;
}

const WhatsAppMessageComposer: React.FC<WhatsAppMessageComposerProps> = ({
  conversationId,
  onMessageSent,
}) => {
  const supabaseClient = useSupabaseClient();
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState<WhatsAppMessageTemplate | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSendMessage = async () => {
    if (!message) return;

    const { data, error } = await supabaseClient
      .from('whatsapp_messages')
      .insert([
        {
          conversation_id: conversationId,
          message,
          template_id: template?.id,
          attachment: attachment ? await uploadAttachment(attachment) : null,
        },
      ]);

    if (error) {
      console.error(error);
    } else {
      onMessageSent();
      setMessage('');
      setTemplate(null);
      setAttachment(null);
    }
  };

  const uploadAttachment = async (file: File) => {
    const { data, error } = await supabaseClient.storage.from('whatsapp-attachments').upload(file.name, file);
    if (error) {
      console.error(error);
    }
    return data.Key;
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <select value={template?.id || ''} onChange={(e) => setTemplate({ id: e.target.value, name: '' })}>
        <option value="">Select a template</option>
        {[
          { id: 'template-1', name: 'Template 1' },
          { id: 'template-2', name: 'Template 2' },
        ].map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
      <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
};

export default WhatsAppMessageComposer;
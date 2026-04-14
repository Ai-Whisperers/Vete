import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';

interface WhatsAppMessageProps {
  messageId: string;
}

const WhatsAppMessage: React.FC<WhatsAppMessageProps> = ({ messageId }) => {
  const supabaseClient = useSupabaseClient();
  const [message, setMessage] = useState<any | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      const { data, error } = await supabaseClient
        .from('whatsapp_messages')
        .select('*')
        .eq('id', messageId);

      if (error) {
        console.error(error);
      } else {
        setMessage(data[0]);
      }
    };

    fetchMessage();
  }, [messageId]);

  if (!message) return null;

  return (
    <div>
      <p>{message.message}</p>
      {message.attachment && (
        <img src={`https://your-supabase-bucket-url.com/${message.attachment}`} alt="Attachment" />
      )}
      <p>Delivery Status: {message.delivery_status}</p>
    </div>
  );
};

export default WhatsAppMessage;
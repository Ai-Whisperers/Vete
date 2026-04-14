import { useState } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';

interface Props {
  children: React.ReactNode;
}

const NotificationSender: React.FC<Props> = ({ children }) => {
  const [message, setMessage] = useState('');
  const supabase = useSupabaseClient();

  const handleSendMessage = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const response = await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message,
              subscription: subscription.toJSON(),
            }),
          });
          const result = await response.json();
          console.log(result);
        }
      }
    }
  };

  return (
    <div>
      {children}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={handleSendMessage}>Send Notification</button>
    </div>
  );
};

export default NotificationSender;
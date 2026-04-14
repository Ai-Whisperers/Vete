import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';

interface Props {
  children: React.ReactNode;
}

const NotificationClickHandler: React.FC<Props> = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const handleNotificationClick = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.addEventListener('notificationclick', (event) => {
            event.notification.close();
            setNotification(event.notification.data);
          });
        }
      }
    };
    handleNotificationClick();
  }, []);

  return (
    <div>
      {children}
      {notification ? (
        <div>
          <h2>Notification Clicked</h2>
          <p>{notification.message}</p>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationClickHandler;
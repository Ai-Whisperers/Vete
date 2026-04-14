import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';

interface Props {
  children: React.ReactNode;
}

const NotificationPermission: React.FC<Props> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const supabase = useSupabaseClient();

  useEffect(() => {
    const checkPermission = async () => {
      const permission = await Notification.requestPermission();
      setPermission(permission);
    };
    checkPermission();
  }, []);

  const handlePermissionChange = async () => {
    const permission = await Notification.requestPermission();
    setPermission(permission);
  };

  const saveSubscription = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_PUBLIC_KEY',
        });
        await supabase.from('notification_subscriptions').insert([{
          subscription: JSON.stringify(subscription),
        }]);
      }
    }
  };

  return (
    <div>
      {children}
      {permission === 'granted' ? (
        <button onClick={saveSubscription}>Save Subscription</button>
      ) : (
        <button onClick={handlePermissionChange}>Request Permission</button>
      )}
    </div>
  );
};

export default NotificationPermission;
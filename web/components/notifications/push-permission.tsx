import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const PushPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const router = useRouter();

  useEffect(() => {
    Notification.requestPermission((permission) => {
      setPermission(permission);
    });
  }, []);

  const handlePermission = () => {
    Notification.requestPermission((permission) => {
      setPermission(permission);
    });
  };

  if (permission === 'granted') {
    router.push('/notifications');
  }

  return (
    <div>
      <h1>Push Notification Permission</h1>
      <p>Permission: {permission}</p>
      <button onClick={handlePermission}>Request Permission</button>
    </div>
  );
};

export default PushPermission;
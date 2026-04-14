import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';

interface Props {
  children: React.ReactNode;
}

const NotificationPreferences: React.FC<Props> = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const getPreferences = async () => {
      const response = await supabase.from('notification_preferences').select('*');
      setPreferences(response.data);
    };
    getPreferences();
  }, []);

  const handlePreferenceChange = async (preference) => {
    await supabase.from('notification_preferences').update([preference]);
    setPreferences((prevPreferences) => prevPreferences.map((prevPreference) => (prevPreference.id === preference.id ? preference : prevPreference)));
  };

  return (
    <div>
      {children}
      {preferences ? (
        <div>
          <h2>Notification Preferences</h2>
          {preferences.map((preference) => (
            <div key={preference.id}>
              <label>
                <input
                  type="checkbox"
                  checked={preference.enabled}
                  onChange={() => handlePreferenceChange({ ...preference, enabled: !preference.enabled })}
                />
                {preference.name}
              </label>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default NotificationPreferences;
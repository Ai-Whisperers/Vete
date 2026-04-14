import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
      } else {
        setSession(data.session);
      }
    };

    fetchSession();
  }, []);

  return (
    <div>
      {children}
    </div>
  );
};

export default SessionProvider;
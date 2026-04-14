import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Session {
  user: {
    id: number;
    email: string;
  };
}

const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }

      setSession(data.session);
    };

    fetchSession();
  }, []);

  return session;
};

export default useSession;
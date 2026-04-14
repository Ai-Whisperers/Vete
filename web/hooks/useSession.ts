import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const useSession = () => {
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

  return [session];
};

export { useSession };
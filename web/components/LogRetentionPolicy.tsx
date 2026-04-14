import { useState, useEffect } from 'react';
import { supabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

const supabase = supabaseClient(supabaseUrl, supabaseKey, supabaseSecret);

interface LogRetentionPolicy {
  id: number;
  days: number;
}

const LogRetentionPolicy = () => {
  const [policy, setPolicy] = useState<LogRetentionPolicy | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      const { data, error } = await supabase
        .from('log_retention_policies')
        .select('id, days')
        .eq('id', 1);

      if (error) {
        console.error(error);
      } else {
        setPolicy(data[0] as LogRetentionPolicy);
      }
    };

    fetchPolicy();
  }, []);

  const handleUpdatePolicy = async (days: number) => {
    const { data, error } = await supabase
      .from('log_retention_policies')
      .update({ id: 1, days });

    if (error) {
      console.error(error);
    } else {
      setPolicy({ id: 1, days });
    }
  };

  return (
    <div>
      <h1>Log Retention Policy</h1>
      {policy ? (
        <div>
          <p>Current policy: {policy.days} days</p>
          <input
            type="number"
            value={policy.days}
            onChange={(e) => handleUpdatePolicy(parseInt(e.target.value))}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default LogRetentionPolicy;
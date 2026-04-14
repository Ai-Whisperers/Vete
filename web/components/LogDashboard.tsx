import { useState, useEffect } from 'react';
import { supabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

const supabase = supabaseClient(supabaseUrl, supabaseKey, supabaseSecret);

interface LogDashboard {
  id: number;
  message: string;
  timestamp: Date;
}

const LogDashboard = () => {
  const [logs, setLogs] = useState<LogDashboard[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('id, message, timestamp');

      if (error) {
        console.error(error);
      } else {
        setLogs(data as LogDashboard[]);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <h1>Log Dashboard</h1>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.message} - {log.timestamp.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogDashboard;
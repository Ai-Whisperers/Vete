import { useState, useEffect } from 'react';
import { supabaseClient } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

const supabase = supabaseClient(supabaseUrl, supabaseKey, supabaseSecret);

interface Log {
  id: number;
  message: string;
  timestamp: Date;
}

const fetchLogs = async () => {
  const { data, error } = await supabase
    .from('logs')
    .select('id, message, timestamp');

  if (error) {
    throw error;
  }

  return data as Log[];
};

const useLogs = () => {
  const { data, error, isLoading } = useQuery(
    ['logs'],
    fetchLogs,
    {
      staleTime: 10000,
    }
  );

  return { data, error, isLoading };
};

const LogAggregator = () => {
  const { data, error, isLoading } = useLogs();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Logs</h1>
      <ul>
        {data.map((log) => (
          <li key={log.id}>
            {log.message} - {log.timestamp.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogAggregator;
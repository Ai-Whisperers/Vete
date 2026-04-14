import { useState } from 'react';
import { supabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSecret = process.env.SUPABASE_SECRET;

const supabase = supabaseClient(supabaseUrl, supabaseKey, supabaseSecret);

interface LogQuery {
  id: number;
  message: string;
  timestamp: Date;
}

const LogQueryInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LogQuery[]>([]);

  const handleQuery = async () => {
    const { data, error } = await supabase
      .from('logs')
      .select('id, message, timestamp')
      .textSearch('message', query);

    if (error) {
      console.error(error);
    } else {
      setResults(data as LogQuery[]);
    }
  };

  return (
    <div>
      <h1>Log Query Interface</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search logs"
      />
      <button onClick={handleQuery}>Search</button>
      <ul>
        {results.map((result) => (
          <li key={result.id}>
            {result.message} - {result.timestamp.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogQueryInterface;
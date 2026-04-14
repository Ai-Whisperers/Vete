import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useLangfuse } from '../lib/langfuse';

const Tracing = () => {
  const supabaseClient = useSupabaseClient();
  const { startTrace, endTrace } = useLangfuse();
  const [traceId, setTraceId] = useState<string | null>(null);

  useEffect(() => {
    const startTracing = async () => {
      const traceId = await startTrace();
      setTraceId(traceId);
    };
    startTracing();
  }, [startTrace]);

  const handleEndTrace = async () => {
    if (traceId) {
      await endTrace(traceId);
      setTraceId(null);
    }
  };

  return (
    <div>
      <h1>Tracing</h1>
      {traceId ? (
        <p>Trace ID: {traceId}</p>
      ) : (
        <p>No trace ID</p>
      )}
      <button onClick={handleEndTrace}>End Trace</button>
    </div>
  );
};

export default Tracing;
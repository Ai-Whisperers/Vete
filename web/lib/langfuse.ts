import { Langfuse } from '@langfuse/sdk';

const langfuse = new Langfuse({
  // Your Langfuse API key
  apiKey: process.env.LANGFUSE_API_KEY,
});

export const useLangfuse = () => {
  const startTrace = async () => {
    const traceId = await langfuse.startTrace();
    return traceId;
  };

  const endTrace = async (traceId: string) => {
    await langfuse.endTrace(traceId);
  };

  return { startTrace, endTrace };
};
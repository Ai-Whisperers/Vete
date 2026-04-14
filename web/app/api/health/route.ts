import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Define the response schema
const HealthResponse = z.object({
  status: z.string(),
  timestamp: z.string(),
  version: z.string(),
});

// Define the route
export async function GET() {
  const client = await createClient('anon');
  const { data, error } = await client.from('profiles').select('id').eq('id', 'test').single();

  if (error) {
    return new Response(JSON.stringify({ status: 'error', timestamp: new Date().toISOString(), version: '1.0.0' }), { status: 500 });
  }

  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  return NextResponse.json(response, { status: 200 });
}
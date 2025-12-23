
import { NextResponse } from 'next/server';

export async function GET() {
  const results = {
    google: { status: 'pending', error: null as any },
    supabase: { status: 'pending', error: null as any },
    env: {
        node: process.version,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing'
    }
  };

  try {
    const start = Date.now();
    const res = await fetch('https://www.google.com', { method: 'HEAD' });
    results.google = { status: `ok (${res.status})`, error: null };
  } catch (e: any) {
    results.google = { status: 'failed', error: e.message };
  }

  try {
    const start = Date.now();
    const res = await fetch('https://okddppczckbjdotrxiev.supabase.co', { method: 'HEAD' });
    results.supabase = { status: `ok (${res.status})`, error: null };
  } catch (e: any) {
    results.supabase = { status: 'failed', error: e.message };
  }

  return NextResponse.json(results);
}

export const dynamic = 'force-dynamic';

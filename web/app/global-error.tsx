import { NextResponse } from 'next/server';
import { setCSPHeaders } from '@/lib/utils';

export function GET() {
  const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  setCSPHeaders(response);

  return response;
}
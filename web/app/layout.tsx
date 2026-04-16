import { NextResponse } from 'next/server';
import { setCSPHeaders } from '@/lib/utils';

export function GET() {
  const response = NextResponse.redirect(new URL('/home', 'https://example.com'));
  setCSPHeaders(response);

  return response;
}
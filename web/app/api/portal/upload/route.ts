import { NextResponse } from 'next/server';
import { POST } from './actions';

export async function GET() {
  return new Response('Not Found', { status: 404 });
}

export async function POST(request: Request) {
  return POST({ request });
}
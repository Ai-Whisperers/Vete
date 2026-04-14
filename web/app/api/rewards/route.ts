import { NextResponse } from 'next/server';
import { GET, POST } from './actions';

export async function GET() {
  return await GET();
}

export async function POST({ request }) {
  return await POST({ request });
}

### Store
import { NextResponse } from 'next/server'
import { withVersioning } from '@/lib/api/versioning'

export async function GET(request: Request) {
  const version = request.nextUrl.pathname.split('/')[2]
  const handler = withVersioning(version)
  return handler(request)
}
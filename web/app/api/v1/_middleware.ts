import { NextResponse } from 'next/server'
import { withDeprecationNotice } from '@/lib/api/deprecation'

export async function GET(request: Request) {
  const handler = withDeprecationNotice('v1')
  return handler(request)
}
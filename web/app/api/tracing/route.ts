import { NextRequest } from 'next/server'
import { TracingService } from '@/lib/tracing/service'

const tracingService = new TracingService()

export async function POST(request: NextRequest) {
  const trace = await request.json()
  await tracingService.sendTrace(trace)
  return new Response('Trace sent successfully', { status: 201 })
}
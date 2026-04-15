import { useServer } from '@react-hook/use-server'
import { TracingService } from '@/lib/tracing/service'

export async function getTraces() {
  const tracingService = new TracingService()
  const traces = await tracingService.getTraces()
  return traces
}

export async function getTrace(id: string) {
  const tracingService = new TracingService()
  const trace = await tracingService.getTrace(id)
  return trace
}
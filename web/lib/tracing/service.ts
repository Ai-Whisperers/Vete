import { createClient } from '@langfuse/client'
import { Trace } from './types'

const tracingClient = createClient({
  apiKey: process.env.LANGFUSE_API_KEY,
  apiSecret: process.env.LANGFUSE_API_SECRET,
})

export class TracingService {
  async sendTrace(trace: Trace) {
    try {
      await tracingClient.sendTrace(trace)
    } catch (error) {
      console.error('Error sending trace:', error)
    }
  }
}
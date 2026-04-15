import type { NextRequest } from 'next/server'
import { WebhookService } from '@/lib/domain/core/webhooks/service'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const service = new WebhookService(supabase)

  const { id, tenantId } = await request.json()

  if (request.method === 'POST') {
    const webhook = await service.createWebhook({ url: 'https://example.com', secret: 'secret', events: ['appointment_created'] }, tenantId)
    return new Response(JSON.stringify(webhook), { status: 201 })
  }

  if (request.method === 'GET') {
    const webhook = await service.getWebhook(id, tenantId)
    return new Response(JSON.stringify(webhook), { status: 200 })
  }

  if (request.method === 'PATCH') {
    const webhook = await service.updateWebhook(id, { url: 'https://example.com', secret: 'secret', events: ['appointment_created'] }, tenantId)
    return new Response(JSON.stringify(webhook), { status: 200 })
  }

  if (request.method === 'DELETE') {
    await service.deleteWebhook(id, tenantId)
    return new Response(null, { status: 204 })
  }

  return new Response(null, { status: 405 })
}
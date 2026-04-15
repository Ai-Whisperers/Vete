import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MessagingService } from '@/lib/domain/core/messaging/service'

export async function sendMessage(conversationId: string, input: any) {
  const supabase = await createClient('anon')
  const messagingService = new MessagingService(supabase)

  const message = await messagingService.sendMessage(conversationId, 'tenant-001', input)

  return NextResponse.json(message)
}
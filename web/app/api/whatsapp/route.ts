import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MessagingService } from '@/lib/domain/core/messaging/service'

export async function GET(request: Request) {
  const supabase = await createClient('anon')
  const messagingService = new MessagingService(supabase)

  const conversations = await messagingService.listConversations('tenant-001')

  return NextResponse.json(conversations)
}

export async function POST(request: Request) {
  const supabase = await createClient('anon')
  const messagingService = new MessagingService(supabase)

  const input = await request.json()

  const conversation = await messagingService.createConversation('tenant-001', input)

  return NextResponse.json(conversation)
}
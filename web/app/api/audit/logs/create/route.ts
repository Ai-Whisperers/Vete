import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuditService } from '@/lib/domain/audit/service'

export async function POST(request: Request) {
  const { log } = await request.json()
  const supabase = await createClient()
  const auditService = new AuditService(supabase)

  const createdLog = await auditService.createAuditLog(log, 'tenant-id')

  return NextResponse.json(createdLog)
}
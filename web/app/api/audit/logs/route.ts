import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuditService } from '@/lib/domain/audit/service'

export async function GET(request: Request) {
  const supabase = await createClient()
  const auditService = new AuditService(supabase)

  const logs = await auditService.getAuditLogs({}, 'tenant-id')

  return NextResponse.json(logs)
}
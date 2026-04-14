import { NextResponse } from 'next/server'
import { createAuditClient } from '@/lib/supabase/audit-client'
import { AuditService } from '@/lib/domain/audit/service'

export async function GET(request: Request) {
  const supabase = await createAuditClient()
  const auditService = new AuditService(supabase)

  const auditLogs = await auditService.getAuditLogs({}, 'tenant-id')

  return NextResponse.json(auditLogs)
}
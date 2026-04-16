import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuditService } from '@/lib/domain/audit/service'

export async function GET(request: Request) {
  const id = request.nextUrl.searchParams.get('id')
  const supabase = await createClient()
  const auditService = new AuditService(supabase)

  const log = await auditService.getAuditLog(id, 'tenant-id')

  if (!log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 })
  }

  return NextResponse.json(log)
}
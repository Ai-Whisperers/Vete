import { useServer } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExportService } from '@/lib/domain/export/service'

export async function POST({ request }) {
  const supabase = await createClient()
  const exportService = new ExportService()

  const input: CreateExportJobInput = await request.json()

  const job = await exportService.createExportJob(
    input.user_id,
    input.tenant_id,
    input
  )

  return new Response(JSON.stringify(job), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function GET({ params }) {
  const supabase = await createClient()
  const exportService = new ExportService()

  const jobId = params.jobId

  const job = await exportService.processExportJob(jobId)

  return new Response(JSON.stringify(job), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
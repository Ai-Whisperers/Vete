import { useServer } from 'next/server';
import { LostPetReportService } from '../../../lib/domain/lost-pets/service';
import { createClient } from '../../../lib/supabase/server';

export async function GET({ params, tenantId }: { params: { id?: string }, tenantId: string }) {
  const supabase = createClient();
  const lostPetReportService = new LostPetReportService(supabase);

  if (params.id) {
    const report = await lostPetReportService.getLostPetReport(params.id, tenantId);
    if (!report) {
      return new Response('Not Found', { status: 404 });
    }

    return new Response(JSON.stringify(report), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const reports = await lostPetReportService.getLostPetReports({}, tenantId);
  return new Response(JSON.stringify(reports), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ params, tenantId, request }: { params: {}, tenantId: string, request: Request }) {
  const supabase = createClient();
  const lostPetReportService = new LostPetReportService(supabase);

  const data = await request.json();
  const report = await lostPetReportService.createLostPetReport(data, tenantId);

  return new Response(JSON.stringify(report), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH({ params, tenantId, request }: { params: { id: string }, tenantId: string, request: Request }) {
  const supabase = createClient();
  const lostPetReportService = new LostPetReportService(supabase);

  const data = await request.json();
  const report = await lostPetReportService.updateLostPetReport(params.id, data, tenantId);

  return new Response(JSON.stringify(report), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
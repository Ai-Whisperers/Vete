import { useServer } from 'next/server';
import { GrowthChartService } from '../../../lib/domain/verticals/clinic/growth-charts/service';
import { createClient } from '../../../lib/supabase/server';

export async function GET({ params, tenantId }: { params: { id: string }, tenantId: string }) {
  const supabase = createClient();
  const growthChartService = new GrowthChartService(supabase);

  const growthChart = await growthChartService.getGrowthChart(params.id, tenantId);

  return new Response(JSON.stringify(growthChart), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ params, tenantId, request }: { params: { id: string }, tenantId: string, request: Request }) {
  const supabase = createClient();
  const growthChartService = new GrowthChartService(supabase);

  const data = await request.json();
  const growthChart = await growthChartService.createGrowthChart(data, tenantId);

  return new Response(JSON.stringify(growthChart), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH({ params, tenantId, request }: { params: { id: string }, tenantId: string, request: Request }) {
  const supabase = createClient();
  const growthChartService = new GrowthChartService(supabase);

  const data = await request.json();
  const growthChart = await growthChartService.updateGrowthChart(params.id, data, tenantId);

  return new Response(JSON.stringify(growthChart), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
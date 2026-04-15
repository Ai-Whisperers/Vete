import { useServer } from 'next/server';
import { DentalChartService } from '@/lib/domain/verticals/clinic/dental/service';
import { CreateDentalChartData, UpdateDentalChartData } from '@/lib/domain/verticals/clinic/dental/types';

export async function POST({ request }) {
  const { petId, toothDiagram, conditions, procedures } = await request.json();

  const data: CreateDentalChartData = {
    pet_id: petId,
    tooth_diagram: toothDiagram,
    conditions,
    procedures,
  };

  const service = new DentalChartService();
  const dentalChart = await service.createDentalChart(data, 'userId', 'tenantId');

  return new Response(JSON.stringify(dentalChart), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function PATCH({ request, params }) {
  const { id } = params;
  const { toothDiagram, conditions, procedures } = await request.json();

  const data: UpdateDentalChartData = {
    tooth_diagram: toothDiagram,
    conditions,
    procedures,
  };

  const service = new DentalChartService();
  const dentalChart = await service.updateDentalChart(id, data, 'userId', 'tenantId');

  return new Response(JSON.stringify(dentalChart), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
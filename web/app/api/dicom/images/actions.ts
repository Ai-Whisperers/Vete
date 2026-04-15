import { NextRequest } from 'next/server';
import { DicomViewerService } from '@/lib/domain/dicom/viewer/service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const service = new DicomViewerService(new DicomViewerRepository(supabase));

  const { image, petId, tenantId } = await request.json();

  const dicomImage = await service.uploadDicomImage(image, petId, tenantId);

  return new Response(JSON.stringify(dicomImage), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const service = new DicomViewerService(new DicomViewerRepository(supabase));

  const id = request.nextUrl.searchParams.get('id');
  const tenantId = request.nextUrl.searchParams.get('tenantId');

  const dicomImage = await service.getDicomImage(id, tenantId);

  if (!dicomImage) {
    return new Response('Not Found', {
      status: 404,
    });
  }

  return new Response(JSON.stringify(dicomImage), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

#### Components

We will create components for the DICOM viewer feature.
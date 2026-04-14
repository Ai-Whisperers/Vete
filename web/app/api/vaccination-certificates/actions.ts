import { useServer } from 'next/server';
import { VaccinationCertificateService } from '@/lib/domain/vaccination-certificates/service';

export async function GET() {
  const service = new VaccinationCertificateService(useServer().supabase);
  const vaccinationCertificates = await service.findMany({}, useServer().tenantId);

  return new Response(JSON.stringify(vaccinationCertificates), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST({ request }) {
  const service = new VaccinationCertificateService(useServer().supabase);
  const data = await request.json();
  const vaccinationCertificate = await service.create(data, useServer().tenantId);

  return new Response(JSON.stringify(vaccinationCertificate), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 201,
  });
}

### Components
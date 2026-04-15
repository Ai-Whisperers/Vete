import { DiagnosisCodeService } from '@/lib/domain/core/diagnosis-codes/service';

export async function GET() {
  const service = new DiagnosisCodeService();
  const diagnosisCodes = await service.getAllDiagnosisCodes();

  return new Response(JSON.stringify(diagnosisCodes), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST({ request }) {
  const service = new DiagnosisCodeService();
  const { code } = await request.json();

  const diagnosisCode = await service.getDiagnosisCodeByCode(code);

  if (!diagnosisCode) {
    return new Response('Diagnosis code not found', {
      status: 404,
    });
  }

  return new Response(JSON.stringify(diagnosisCode), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

#### Database Schema

We will also need to update the database schema to include the diagnosis codes table.

CREATE TABLE diagnosis_codes (
  id UUID PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX diagnosis_codes_tenant_id_idx ON diagnosis_codes (tenant_id);

This implementation follows the existing patterns and provides a basic structure for the diagnosis codes lookup feature. You can build upon this foundation to add more functionality and features as needed.
import { useServer } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { TreatmentSheetService } from '@/lib/domain/verticals/clinic/treatment-sheets/service'

export async function GET() {
  const supabase = createClient()
  const service = new TreatmentSheetService(supabase)

  const treatmentSheets = await service.getTreatmentSheet('123')

  return new Response(JSON.stringify(treatmentSheets), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST() {
  const supabase = createClient()
  const service = new TreatmentSheetService(supabase)

  const treatmentSheet = await service.createTreatmentSheet({
    pet_id: '123',
    hospitalization_id: '456',
    template_id: '789',
  })

  return new Response(JSON.stringify(treatmentSheet), {
    headers: { 'Content-Type': 'application/json' },
  })
}

### Database Schema
CREATE TABLE treatment_sheets (
  id UUID PRIMARY KEY,
  pet_id UUID NOT NULL,
  hospitalization_id UUID,
  template_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  treatment_sheet_id UUID NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  assigned_to UUID,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_assignments (
  id UUID PRIMARY KEY,
  treatment_sheet_id UUID NOT NULL,
  staff_id UUID NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE completion_tracking (
  id UUID PRIMARY KEY,
  treatment_sheet_id UUID NOT NULL,
  task_id UUID NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
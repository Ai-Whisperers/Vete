import { createClient } from '@/lib/supabase/client';
import { QualityOfLifeService } from '@/lib/domain/verticals/clinic/quality-of-life/service';

export async function createAssessment(
  petId: string,
  tenantId: string,
  performedBy: string,
  score: QualityOfLifeScore,
) {
  const supabase = createClient();
  const service = new QualityOfLifeService(supabase);

  return service.createAssessment(petId, tenantId, performedBy, score);
}

export async function getAssessments(petId: string, tenantId: string) {
  const supabase = createClient();
  const service = new QualityOfLifeService(supabase);

  return service.getAssessments(petId, tenantId);
}

### Database Schema

You need to create the `quality_of_life_assessments` table in your Supabase database with the following schema:
CREATE TABLE quality_of_life_assessments (
  id UUID PRIMARY KEY,
  pet_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  performed_by UUID NOT NULL,
  score JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
Note: This is a basic implementation and you may need to adjust it according to your specific requirements. Additionally, you should add error handling and validation to ensure the data is correct and consistent.
import { createClient } from '@/lib/supabase/client';
import { QualityOfLifeRepository } from './repository';
import { QualityOfLifeAssessment, QualityOfLifeScore } from './types';

export class QualityOfLifeService {
  private repository: QualityOfLifeRepository;

  constructor(supabase: ReturnType<typeof createClient>) {
    this.repository = new QualityOfLifeRepository(supabase);
  }

  async createAssessment(
    petId: string,
    tenantId: string,
    performedBy: string,
    score: QualityOfLifeScore,
  ): Promise<QualityOfLifeAssessment> {
    return this.repository.createAssessment(petId, tenantId, performedBy, score);
  }

  async getAssessments(petId: string, tenantId: string): Promise<QualityOfLifeAssessment[]> {
    return this.repository.getAssessments(petId, tenantId);
  }
}

### Server Actions
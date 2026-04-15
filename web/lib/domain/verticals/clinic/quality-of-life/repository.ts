import { createClient } from '@/lib/supabase/client';
import { QualityOfLifeAssessment } from './types';

export class QualityOfLifeRepository {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
  }

  async createAssessment(
    petId: string,
    tenantId: string,
    performedBy: string,
    score: QualityOfLifeScore,
  ): Promise<QualityOfLifeAssessment> {
    const { data, error } = await this.supabase
      .from('quality_of_life_assessments')
      .insert({
        pet_id: petId,
        tenant_id: tenantId,
        performed_by: performedBy,
        score: JSON.stringify(score),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      petId: data.pet_id,
      tenantId: data.tenant_id,
      performedBy: data.performed_by,
      score: JSON.parse(data.score) as QualityOfLifeScore,
      trend: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getAssessments(petId: string, tenantId: string): Promise<QualityOfLifeAssessment[]> {
    const { data, error } = await this.supabase
      .from('quality_of_life_assessments')
      .select('*')
      .eq('pet_id', petId)
      .eq('tenant_id', tenantId);

    if (error) {
      throw error;
    }

    return data.map((assessment) => ({
      id: assessment.id,
      petId: assessment.pet_id,
      tenantId: assessment.tenant_id,
      performedBy: assessment.performed_by,
      score: JSON.parse(assessment.score) as QualityOfLifeScore,
      trend: [],
      createdAt: new Date(assessment.created_at),
      updatedAt: new Date(assessment.updated_at),
    }));
  }
}

#### Service
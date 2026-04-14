import { VaccinationCertificateRepository } from './repository';
import { supabase } from '@/lib/supabase/service';
import { VaccinationCertificate, CreateVaccinationCertificateData } from './types';

export class VaccinationCertificateService {
  private repository: VaccinationCertificateRepository;

  constructor(supabase: typeof supabase) {
    this.repository = new VaccinationCertificateRepository(supabase);
  }

  async create(data: CreateVaccinationCertificateData, tenantId: string): Promise<VaccinationCertificate> {
    return this.repository.create(data, tenantId);
  }

  async findById(id: string, tenantId: string): Promise<VaccinationCertificate | null> {
    return this.repository.findById(id, tenantId);
  }

  async findMany(filters: any = {}, tenantId: string): Promise<VaccinationCertificate[]> {
    return this.repository.findMany(filters, tenantId);
  }
}

### Server Actions
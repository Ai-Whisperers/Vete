import type { SupabaseClient } from '@supabase/supabase-js';
import { QrPaymentRepository } from './repository';
import type { QrPayment, CreateQrPaymentInput, QrPaymentFilters } from './types';

export class QrPaymentService {
  private repository: QrPaymentRepository;

  constructor(private supabase: SupabaseClient) {
    this.repository = new QrPaymentRepository(supabase);
  }

  async createQrPayment(tenantId: string, input: CreateQrPaymentInput): Promise<QrPayment> {
    return this.repository.create(tenantId, input);
  }

  async getQrPayments(tenantId: string, filters: QrPaymentFilters = {}): Promise<QrPayment[]> {
    return this.repository.findMany(tenantId, filters);
  }
}
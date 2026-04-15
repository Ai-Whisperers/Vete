import type { SupabaseClient } from '@supabase/supabase-js';
import type { QrPayment, CreateQrPaymentInput, QrPaymentFilters } from './types';

export class QrPaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(tenantId: string, input: CreateQrPaymentInput): Promise<QrPayment> {
    const { invoiceId, amount } = input;

    const { data, error } = await this.supabase
      .from('qr_payments')
      .insert({
        tenant_id: tenantId,
        invoice_id: invoiceId,
        amount,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating QR payment: ${error.message}`);
    }

    return data as QrPayment;
  }

  async findMany(tenantId: string, filters: QrPaymentFilters = {}): Promise<QrPayment[]> {
    let query = this.supabase
      .from('qr_payments')
      .select('*')
      .eq('tenant_id', tenantId);

    if (filters.invoiceId) {
      query = query.eq('invoice_id', filters.invoiceId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error loading QR payments: ${error.message}`);
    }

    return (data || []) as QrPayment[];
  }
}
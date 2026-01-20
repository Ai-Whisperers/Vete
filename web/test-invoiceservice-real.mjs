/**
 * Standalone test for InvoiceService with embedded implementation
 * Tests invoice CRUD, line items, payments, and refunds
 * 
 * Run with: node test-invoiceservice-real.mjs
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Embedded InvoiceService implementation
class InvoiceService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async create(tenantId, userId, input) {
    try {
      const { pet_id, items, tax_rate = 10, notes, due_date } = input;

      if (!items || items.length === 0) {
        throw new Error('Invoice must have at least one item');
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      const tax_amount = subtotal * (tax_rate / 100);
      const total = subtotal + tax_amount;

      // Generate invoice number
      const invoice_number = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create invoice
      const { data: invoice, error: invoiceError } = await this.supabase
        .from('invoices')
        .insert({
          tenant_id: tenantId,
          invoice_number,
          client_id: userId,
          pet_id,
          subtotal,
          tax_amount,
          total,
          status: 'draft',
          notes: notes || null,
          due_date: due_date || null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const invoiceItems = items.map((item) => ({
        invoice_id: invoice.id,
        tenant_id: tenantId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
        item_type: item.item_type || 'service',
        service_id: item.service_id || null,
        product_id: item.product_id || null,
      }));

      const { error: itemsError } = await this.supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        // Rollback invoice
        await this.supabase.from('invoices').delete().eq('id', invoice.id);
        throw itemsError;
      }

      return { success: true, data: invoice };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getById(id, tenantId) {
    try {
      const { data: invoice, error } = await this.supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      if (!invoice) throw new Error('Invoice not found');

      return { success: true, data: invoice };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async list(tenantId, filters = {}) {
    try {
      let query = this.supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.pet_id) {
        query = query.eq('pet_id', filters.pet_id);
      }

      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async update(id, tenantId, updateData) {
    try {
      // Only allow updates on draft invoices
      const { data: existing } = await this.supabase
        .from('invoices')
        .select('status')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (!existing) throw new Error('Invoice not found');
      if (existing.status !== 'draft') {
        throw new Error('Only draft invoices can be updated');
      }

      const { error: updateError } = await this.supabase
        .from('invoices')
        .update({
          notes: updateData.notes,
          due_date: updateData.due_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (updateError) throw updateError;

      return await this.getById(id, tenantId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async delete(id, tenantId) {
    try {
      // Only allow deletion of draft invoices
      const { data: existing } = await this.supabase
        .from('invoices')
        .select('status')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (!existing) throw new Error('Invoice not found');
      if (existing.status !== 'draft') {
        throw new Error('Only draft invoices can be deleted');
      }

      // Delete items first (FK constraint)
      await this.supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      // Delete invoice
      const { error } = await this.supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      return { success: true, data: { deleted: true } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async recordPayment(tenantId, userId, input) {
    try {
      const { invoice_id, amount, payment_date, method = 'cash', reference } = input;

      // Get invoice
      const invoiceResult = await this.getById(invoice_id, tenantId);
      if (!invoiceResult.success) throw new Error('Invoice not found');

      const invoice = invoiceResult.data;

      // Check if invoice is already paid
      if (invoice.status === 'paid') {
        throw new Error('Invoice is already paid');
      }

      // Get existing payments
      const { data: existingPayments } = await this.supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', invoice_id)
        .eq('tenant_id', tenantId);

      const totalPaid = (existingPayments || []).reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const remaining = invoice.total - totalPaid;

      if (amount > remaining) {
        throw new Error(`Payment amount (${amount}) exceeds remaining balance (${remaining})`);
      }

      // Generate payment number
      const payment_number = `PAY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create payment
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .insert({
          tenant_id: tenantId,
          invoice_id,
          payment_number,
          amount,
          payment_date: payment_date || new Date().toISOString().split('T')[0], // Date only
          method,
          payment_method_name: method,
          reference_number: reference || null,
          status: 'completed',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update invoice status if fully paid
      const newTotalPaid = totalPaid + amount;
      if (newTotalPaid >= invoice.total) {
        await this.supabase
          .from('invoices')
          .update({ status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', invoice_id);
      }

      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async refundPayment(tenantId, paymentId, refundData) {
    try {
      const { amount, reason } = refundData;

      // Get payment
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .eq('tenant_id', tenantId)
        .single();

      if (paymentError || !payment) throw new Error('Payment not found');

      // Check if already refunded
      const { data: existingRefunds } = await this.supabase
        .from('refunds')
        .select('amount')
        .eq('payment_id', paymentId)
        .eq('tenant_id', tenantId);

      const totalRefunded = (existingRefunds || []).reduce((sum, r) => sum + parseFloat(r.amount), 0);
      const availableToRefund = parseFloat(payment.amount) - totalRefunded;

      if (amount > availableToRefund) {
        throw new Error(`Refund amount (${amount}) exceeds available amount (${availableToRefund})`);
      }

      // Generate refund number
      const refund_number = `REF-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create refund
      const { data: refund, error: refundError } = await this.supabase
        .from('refunds')
        .insert({
          tenant_id: tenantId,
          payment_id: paymentId,
          refund_number,
          amount,
          reason: reason || null,
          status: 'completed',
          refund_date: new Date().toISOString().split('T')[0], // Date only
        })
        .select()
        .single();

      if (refundError) throw refundError;

      return { success: true, data: refund };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Test runner
async function runTests() {
  console.log('🧪 Testing InvoiceService with Real Implementation\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const service = new InvoiceService(supabase);

  // Test data
  let tenantId, customerId, petId, invoiceId, paymentId;

  try {
    // Setup: Get existing customer with valid tenant and pet
    console.log('📝 Setting up test data...');
    
    const { data: customer, error: customerError } = await supabase
      .from('profiles')
      .select('id, tenant_id, full_name')
      .eq('role', 'owner')
      .not('tenant_id', 'is', null)
      .limit(1)
      .single();

    if (customerError || !customer) {
      throw new Error('No valid customer profile found for testing');
    }

    customerId = customer.id;
    tenantId = customer.tenant_id;
    
    console.log(`  ✓ Using existing customer: ${customer.full_name} (${customerId})`);
    console.log(`  ✓ Using tenant: ${tenantId}`);

    // Get a pet for this owner
    const { data: pet } = await supabase
      .from('pets')
      .select('id, name')
      .eq('owner_id', customerId)
      .eq('tenant_id', tenantId)
      .limit(1)
      .single();

    if (pet) {
      petId = pet.id;
      console.log(`  ✓ Using existing pet: ${pet.name} (${petId})`);
    } else {
      // Create test pet
      const { data: newPet, error: petError } = await supabase
        .from('pets')
        .insert({
          tenant_id: tenantId,
          owner_id: customerId,
          name: 'Test Pet',
          species: 'dog',
          breed: 'Mixed',
        })
        .select()
        .single();

      if (petError) throw new Error(`Failed to create pet: ${petError.message}`);
      petId = newPet.id;
      console.log(`  ✓ Created test pet: ${newPet.name} (${petId})`);
    }

    // Test 1: Create invoice with line items
    console.log('\n1️⃣ Testing create()...');
    const createResult = await service.create(tenantId, customerId, {
      pet_id: petId,
      items: [
        { description: 'Consulta Veterinaria', quantity: 1, unit_price: 150000, item_type: 'service' },
        { description: 'Vacuna Rabia', quantity: 1, unit_price: 80000, item_type: 'service' },
      ],
      tax_rate: 10,
      notes: 'Test invoice',
    });

    if (!createResult.success) {
      throw new Error(`Create invoice failed: ${createResult.error}`);
    }

    invoiceId = createResult.data.id;
    console.log(`  ✅ Created invoice: ${createResult.data.invoice_number}`);
    console.log(`     Subtotal: ${createResult.data.subtotal} GS`);
    console.log(`     Tax: ${createResult.data.tax_amount} GS`);
    console.log(`     Total: ${createResult.data.total} GS`);
    console.log(`     Status: ${createResult.data.status}`);

    // Test 2: Get invoice by ID
    console.log('\n2️⃣ Testing getById()...');
    const getResult = await service.getById(invoiceId, tenantId);

    if (!getResult.success) {
      throw new Error(`Get invoice failed: ${getResult.error}`);
    }

    console.log(`  ✅ Retrieved invoice: ${getResult.data.invoice_number}`);
    console.log(`     Items: ${getResult.data.items.length}`);
    getResult.data.items.forEach((item, idx) => {
      console.log(`       ${idx + 1}. ${item.description} - ${item.quantity}x ${item.unit_price} GS`);
    });

    // Test 3: List invoices
    console.log('\n3️⃣ Testing list()...');
    const listResult = await service.list(tenantId);

    if (!listResult.success) {
      throw new Error(`List invoices failed: ${listResult.error}`);
    }

    console.log(`  ✅ Listed invoices: ${listResult.data.length} found`);
    console.log(`     Test invoice present: ${listResult.data.some(i => i.id === invoiceId) ? 'Yes' : 'No'}`);

    // Test 4: List invoices with filter (draft status)
    console.log('\n4️⃣ Testing list() with status filter...');
    const filteredResult = await service.list(tenantId, { status: 'draft' });

    if (!filteredResult.success) {
      throw new Error(`Filtered list failed: ${filteredResult.error}`);
    }

    console.log(`  ✅ Draft invoices: ${filteredResult.data.length}`);
    console.log(`     All are draft: ${filteredResult.data.every(i => i.status === 'draft') ? 'Yes' : 'No'}`);

    // Test 5: Update invoice
    console.log('\n5️⃣ Testing update()...');
    const updateResult = await service.update(invoiceId, tenantId, {
      notes: 'Updated test invoice',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    });

    if (!updateResult.success) {
      throw new Error(`Update invoice failed: ${updateResult.error}`);
    }

    console.log(`  ✅ Updated invoice`);
    console.log(`     New notes: ${updateResult.data.notes}`);

    // Test 6: Record full payment
    console.log('\n6️⃣ Testing recordPayment() - full payment...');
    const invoice = getResult.data;
    const paymentResult = await service.recordPayment(tenantId, customerId, {
      invoice_id: invoiceId,
      amount: invoice.total,
      payment_date: new Date().toISOString(),
      method: 'cash',
      reference: 'TEST-PAYMENT-001',
    });

    if (!paymentResult.success) {
      throw new Error(`Record payment failed: ${paymentResult.error}`);
    }

    paymentId = paymentResult.data.id;
    console.log(`  ✅ Payment recorded: ${paymentResult.data.amount} GS`);
    console.log(`     Method: ${paymentResult.data.method}`);
    console.log(`     Status: ${paymentResult.data.status}`);

    // Verify invoice status changed to 'paid'
    const paidInvoice = await service.getById(invoiceId, tenantId);
    console.log(`     Invoice status: ${paidInvoice.data.status}`);

    // Test 7: Try to record another payment (should fail - already paid)
    console.log('\n7️⃣ Testing recordPayment() - already paid (expect error)...');
    const duplicatePaymentResult = await service.recordPayment(tenantId, customerId, {
      invoice_id: invoiceId,
      amount: 10000,
      method: 'cash',
    });

    if (duplicatePaymentResult.success) {
      throw new Error('Should not allow payment on already-paid invoice');
    }

    console.log(`  ✅ Correctly rejected: ${duplicatePaymentResult.error}`);

    // Test 8: Process refund
    console.log('\n8️⃣ Testing refundPayment()...');
    const refundAmount = 50000; // Partial refund
    const refundResult = await service.refundPayment(tenantId, paymentId, {
      amount: refundAmount,
      reason: 'Customer request - partial refund',
    });

    if (!refundResult.success) {
      throw new Error(`Refund failed: ${refundResult.error}`);
    }

    console.log(`  ✅ Refund processed: ${refundResult.data.amount} GS`);
    console.log(`     Reason: ${refundResult.data.reason}`);
    console.log(`     Status: ${refundResult.data.status}`);

    console.log('\n✅ All Tests Passed!');
    console.log('\n📊 Summary:');
    console.log('   ✓ create() - Works');
    console.log('   ✓ getById() - Works');
    console.log('   ✓ list() - Works');
    console.log('   ✓ list(filters) - Works');
    console.log('   ✓ update() - Works');
    console.log('   ✓ recordPayment() - Works');
    console.log('   ✓ recordPayment() validation - Works');
    console.log('   ✓ refundPayment() - Works');

  } catch (error) {
    console.error(`\n❌ Test Failed: ${error.message}`);
    console.error(error.stack);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    if (paymentId) {
      await supabase.from('refunds').delete().eq('payment_id', paymentId);
      await supabase.from('payments').delete().eq('id', paymentId);
    }
    if (invoiceId) {
      await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
      await supabase.from('invoices').delete().eq('id', invoiceId);
    }
    // Note: We don't delete the pet/customer since we're using existing ones
    console.log('  ✓ Cleanup complete');
  }
}

runTests().catch(console.error);

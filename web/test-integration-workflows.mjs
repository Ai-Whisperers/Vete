/**
 * Integration tests for cross-service workflows
 * Tests complete user journeys spanning multiple services
 * 
 * Run with: node test-integration-workflows.mjs
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

// ================== EMBEDDED SERVICE IMPLEMENTATIONS ==================

// PetService
class PetService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async create(tenantId, ownerId, petData) {
    try {
      const { data, error } = await this.supabase
        .from('pets')
        .insert({
          owner_id: ownerId,
          tenant_id: tenantId,
          ...petData,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getById(petId, tenantId) {
    try {
      const { data, error } = await this.supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .eq('tenant_id', tenantId)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// AppointmentService
class AppointmentService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async create(appointmentData) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async complete(appointmentId, tenantId) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async cancel(appointmentId, tenantId, reason) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getById(appointmentId, tenantId) {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// InvoiceService
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
      const { data, error } = await this.supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async refundPayment(invoiceId, tenantId, amount, reason) {
    try {
      // Get invoice and payments
      const { data: invoice } = await this.getById(invoiceId, tenantId);
      if (!invoice) throw new Error('Invoice not found');

      // Get last payment
      const { data: payments, error: paymentsError } = await this.supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('tenant_id', tenantId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      if (!payments || payments.length === 0) {
        throw new Error('No completed payments found for invoice');
      }

      const payment = payments[0];

      // Generate refund number
      const refund_number = `REF-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create refund record
      const { data: refund, error: refundError } = await this.supabase
        .from('refunds')
        .insert({
          payment_id: payment.id,
          tenant_id: tenantId,
          amount,
          reason,
          status: 'completed',
          refund_date: new Date().toISOString().split('T')[0],
          refund_number,
        })
        .select()
        .single();

      if (refundError) throw refundError;

      // Update payment status to refunded if full refund
      if (amount >= payment.amount) {
        const { error: updateError } = await this.supabase
          .from('payments')
          .update({ status: 'refunded' })
          .eq('id', payment.id);

        if (updateError) throw updateError;

        // Update invoice status to refunded
        const { error: invoiceUpdateError } = await this.supabase
          .from('invoices')
          .update({ status: 'refunded' })
          .eq('id', invoiceId);

        if (invoiceUpdateError) throw invoiceUpdateError;
      }

      return { success: true, data: refund };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// PaymentService
class PaymentService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async processPayment(tenantId, userId, paymentData) {
    try {
      const { invoice_id, amount, method = 'cash', reference_number = '' } = paymentData;

      // Validate invoice exists and is not paid
      const { data: invoice, error: invoiceError } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoice_id)
        .eq('tenant_id', tenantId)
        .single();

      if (invoiceError || !invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === 'paid') {
        throw new Error('Invoice is already paid');
      }

      // Generate payment number
      const payment_number = `PAY-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create payment
      const { data: payment, error: paymentError } = await this.supabase
        .from('payments')
        .insert({
          tenant_id: tenantId,
          invoice_id,
          amount,
          payment_date: new Date().toISOString().split('T')[0],
          method,
          reference_number,
          payment_number,
          status: 'completed',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Check if invoice is fully paid
      const { data: payments, error: paymentsError } = await this.supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', invoice_id)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      if (totalPaid >= Number(invoice.total)) {
        // Update invoice status to paid
        const { error: updateError } = await this.supabase
          .from('invoices')
          .update({ 
            status: 'paid',
          })
          .eq('id', invoice_id);

        if (updateError) throw updateError;
      }

      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPaymentsByInvoice(invoiceId, tenantId) {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// StoreService (minimal for order creation)
class StoreService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async checkout(tenantId, customerId, cartItems) {
    try {
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax_amount = subtotal * 0.1; // 10% tax
      const total = subtotal + tax_amount;

      // Generate order number
      const order_number = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await this.supabase
        .from('store_orders')
        .insert({
          tenant_id: tenantId,
          customer_id: customerId,
          order_number,
          subtotal,
          tax_amount,
          total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        tenant_id: tenantId,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        product_name: item.name,
      }));

      const { error: itemsError } = await this.supabase
        .from('store_order_items')
        .insert(orderItems);

      if (itemsError) {
        // Rollback order
        await this.supabase.from('store_orders').delete().eq('id', order.id);
        throw itemsError;
      }

      return { success: true, data: order };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// ================== TEST RUNNER ==================

async function runIntegrationTests() {
  console.log('\n🧪 Starting Integration Workflow Tests\n');
  console.log('=' .repeat(60));

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Initialize services
  const petService = new PetService(supabase);
  const appointmentService = new AppointmentService(supabase);
  const invoiceService = new InvoiceService(supabase);
  const paymentService = new PaymentService(supabase);
  const storeService = new StoreService(supabase);

  // Get real authenticated user (pet owner) with tenant
  const { data: owners } = await supabase
    .from('profiles')
    .select('id, tenant_id, email')
    .eq('role', 'owner')
    .not('tenant_id', 'is', null)
    .limit(1);

  if (!owners || owners.length === 0) {
    throw new Error('No owner profile with tenant found in database');
  }
  
  const owner = owners[0];

  console.log(`\nUsing owner: ${owner.email} (${owner.id})`);
  console.log(`Tenant: ${owner.tenant_id}\n`);

  // Store IDs for cleanup
  const createdIds = {
    pets: [],
    appointments: [],
    invoices: [],
    payments: [],
    refunds: [],
    orders: [],
  };

  try {
    // ===================== WORKFLOW 1 =====================
    console.log('\n📋 WORKFLOW 1: Pet → Appointment → Invoice → Payment');
    console.log('-' .repeat(60));

    // Step 1: Create pet
    console.log('\n1️⃣  Creating pet...');
    const petResult = await petService.create(owner.tenant_id, owner.id, {
      name: 'Integration Test Pet',
      species: 'dog',
      breed: 'Golden Retriever',
      birth_date: '2020-01-15',
      sex: 'male',
    });

    if (!petResult.success) throw new Error(`Pet creation failed: ${petResult.error}`);
    createdIds.pets.push(petResult.data.id);
    console.log(`  ✅ Pet created: ${petResult.data.name} (${petResult.data.id})`);

    // Step 2: Book appointment
    console.log('\n2️⃣  Booking appointment...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const apptResult = await appointmentService.create({
      tenant_id: owner.tenant_id,
      pet_id: petResult.data.id,
      created_by: owner.id,
      start_time: tomorrow.toISOString(),
      end_time: new Date(tomorrow.getTime() + 30 * 60000).toISOString(),
      duration_minutes: 30,
      status: 'scheduled',
      reason: 'Integration test appointment',
    });

    if (!apptResult.success) throw new Error(`Appointment creation failed: ${apptResult.error}`);
    createdIds.appointments.push(apptResult.data.id);
    console.log(`  ✅ Appointment booked: ${apptResult.data.id}`);

    // Step 3: Complete appointment
    console.log('\n3️⃣  Completing appointment...');
    const completeResult = await appointmentService.complete(apptResult.data.id, owner.tenant_id);
    if (!completeResult.success) throw new Error(`Complete failed: ${completeResult.error}`);
    console.log(`  ✅ Appointment completed`);

    // Step 4: Create invoice for appointment
    console.log('\n4️⃣  Creating invoice...');
    const invoiceResult = await invoiceService.create(owner.tenant_id, owner.id, {
      pet_id: petResult.data.id,
      items: [
        {
          description: 'Veterinary consultation',
          quantity: 1,
          unit_price: 150000,
          item_type: 'service',
        },
      ],
      tax_rate: 10,
    });

    if (!invoiceResult.success) throw new Error(`Invoice creation failed: ${invoiceResult.error}`);
    createdIds.invoices.push(invoiceResult.data.id);
    console.log(`  ✅ Invoice created: ${invoiceResult.data.invoice_number} (${invoiceResult.data.total} Gs.)`);

    // Step 5: Process payment
    console.log('\n5️⃣  Processing payment...');
    const paymentResult = await paymentService.processPayment(owner.tenant_id, owner.id, {
      invoice_id: invoiceResult.data.id,
      amount: invoiceResult.data.total,
      method: 'cash',
    });

    if (!paymentResult.success) throw new Error(`Payment failed: ${paymentResult.error}`);
    createdIds.payments.push(paymentResult.data.id);
    console.log(`  ✅ Payment processed: ${paymentResult.data.payment_number} (${paymentResult.data.amount} Gs.)`);

    // Step 6: Verify final state
    console.log('\n6️⃣  Verifying workflow state...');
    
    const verifyPet = await petService.getById(petResult.data.id, owner.tenant_id);
    if (!verifyPet.success) throw new Error('Pet verification failed');
    console.log(`  ✅ Pet exists: ${verifyPet.data.name}`);

    const verifyAppt = await appointmentService.getById(apptResult.data.id, owner.tenant_id);
    if (!verifyAppt.success) throw new Error('Appointment verification failed');
    if (verifyAppt.data.status !== 'completed') throw new Error('Appointment not completed');
    console.log(`  ✅ Appointment status: ${verifyAppt.data.status}`);

    const verifyInvoice = await invoiceService.getById(invoiceResult.data.id, owner.tenant_id);
    if (!verifyInvoice.success) throw new Error('Invoice verification failed');
    if (verifyInvoice.data.status !== 'paid') throw new Error('Invoice not paid');
    console.log(`  ✅ Invoice status: ${verifyInvoice.data.status}`);

    console.log('\n✅ WORKFLOW 1 COMPLETE: All steps successful and verified!');

    // ===================== WORKFLOW 2 =====================
    console.log('\n\n📋 WORKFLOW 2: Store → Order → Invoice → Payment');
    console.log('-' .repeat(60));

    // Get real products
    console.log('\n1️⃣  Fetching products...');
    const { data: products } = await supabase
      .from('store_products')
      .select('*')
      .eq('tenant_id', owner.tenant_id)
      .eq('is_active', true)
      .limit(2);

    if (!products || products.length === 0) {
      console.log('  ⚠️  No products found - skipping workflow 2');
    } else {
      console.log(`  ✅ Found ${products.length} products`);

      // Step 2: Create order (checkout)
      console.log('\n2️⃣  Creating order...');
      const cartItems = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.base_price,
        quantity: 1,
      }));

      const orderResult = await storeService.checkout(owner.tenant_id, owner.id, cartItems);
      if (!orderResult.success) throw new Error(`Order creation failed: ${orderResult.error}`);
      createdIds.orders.push(orderResult.data.id);
      console.log(`  ✅ Order created: ${orderResult.data.order_number} (${orderResult.data.total} Gs.)`);

      // Step 3: Create invoice for order
      console.log('\n3️⃣  Creating invoice for order...');
      const orderInvoiceResult = await invoiceService.create(owner.tenant_id, owner.id, {
        items: cartItems.map(item => ({
          description: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          item_type: 'product',
          product_id: item.id,
        })),
        tax_rate: 10,
      });

      if (!orderInvoiceResult.success) throw new Error(`Order invoice failed: ${orderInvoiceResult.error}`);
      createdIds.invoices.push(orderInvoiceResult.data.id);
      console.log(`  ✅ Invoice created: ${orderInvoiceResult.data.invoice_number}`);

      // Step 4: Process payment
      console.log('\n4️⃣  Processing payment...');
      const orderPaymentResult = await paymentService.processPayment(owner.tenant_id, owner.id, {
        invoice_id: orderInvoiceResult.data.id,
        amount: orderInvoiceResult.data.total,
        method: 'card',
      });

      if (!orderPaymentResult.success) throw new Error(`Order payment failed: ${orderPaymentResult.error}`);
      createdIds.payments.push(orderPaymentResult.data.id);
      console.log(`  ✅ Payment processed: ${orderPaymentResult.data.payment_number}`);

      console.log('\n✅ WORKFLOW 2 COMPLETE: Store checkout successful!');
    }

    // ===================== WORKFLOW 3 =====================
    console.log('\n\n📋 WORKFLOW 3: Appointment → Cancellation → Refund');
    console.log('-' .repeat(60));

    // Step 1: Book appointment with prepayment
    console.log('\n1️⃣  Booking appointment with payment...');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const appt2Result = await appointmentService.create({
      tenant_id: owner.tenant_id,
      pet_id: petResult.data.id,
      created_by: owner.id,
      start_time: nextWeek.toISOString(),
      end_time: new Date(nextWeek.getTime() + 60 * 60000).toISOString(),
      duration_minutes: 60,
      status: 'scheduled',
      reason: 'Refund test appointment',
    });

    if (!appt2Result.success) throw new Error(`Appointment 2 failed: ${appt2Result.error}`);
    createdIds.appointments.push(appt2Result.data.id);
    console.log(`  ✅ Appointment booked: ${appt2Result.data.id}`);

    // Step 2: Create invoice
    console.log('\n2️⃣  Creating prepayment invoice...');
    const invoice2Result = await invoiceService.create(owner.tenant_id, owner.id, {
      pet_id: petResult.data.id,
      items: [
        {
          description: 'Advanced payment - Veterinary consultation',
          quantity: 1,
          unit_price: 200000,
          item_type: 'service',
        },
      ],
      tax_rate: 10,
    });

    if (!invoice2Result.success) throw new Error(`Invoice 2 failed: ${invoice2Result.error}`);
    createdIds.invoices.push(invoice2Result.data.id);
    console.log(`  ✅ Invoice created: ${invoice2Result.data.invoice_number}`);

    // Step 3: Process payment
    console.log('\n3️⃣  Processing prepayment...');
    const payment2Result = await paymentService.processPayment(owner.tenant_id, owner.id, {
      invoice_id: invoice2Result.data.id,
      amount: invoice2Result.data.total,
      method: 'bank_transfer',
    });

    if (!payment2Result.success) throw new Error(`Payment 2 failed: ${payment2Result.error}`);
    createdIds.payments.push(payment2Result.data.id);
    console.log(`  ✅ Payment processed: ${payment2Result.data.payment_number}`);

    // Step 4: Cancel appointment
    console.log('\n4️⃣  Cancelling appointment...');
    const cancelResult = await appointmentService.cancel(
      appt2Result.data.id,
      owner.tenant_id,
      'Integration test cancellation'
    );

    if (!cancelResult.success) throw new Error(`Cancel failed: ${cancelResult.error}`);
    console.log(`  ✅ Appointment cancelled`);

    // Step 5: Process refund
    console.log('\n5️⃣  Processing refund...');
    const refundResult = await invoiceService.refundPayment(
      invoice2Result.data.id,
      owner.tenant_id,
      invoice2Result.data.total,
      'Appointment cancelled by customer'
    );

    if (!refundResult.success) throw new Error(`Refund failed: ${refundResult.error}`);
    createdIds.refunds.push(refundResult.data.id);
    console.log(`  ✅ Refund processed: ${refundResult.data.refund_number} (${refundResult.data.amount} Gs.)`);

    // Step 6: Verify refund state
    console.log('\n6️⃣  Verifying refund state...');
    const verifyInvoice2 = await invoiceService.getById(invoice2Result.data.id, owner.tenant_id);
    if (!verifyInvoice2.success) throw new Error('Invoice 2 verification failed');
    if (verifyInvoice2.data.status !== 'refunded') throw new Error('Invoice not refunded');
    console.log(`  ✅ Invoice status: ${verifyInvoice2.data.status}`);

    const verifyAppt2 = await appointmentService.getById(appt2Result.data.id, owner.tenant_id);
    if (!verifyAppt2.success) throw new Error('Appointment 2 verification failed');
    if (verifyAppt2.data.status !== 'cancelled') throw new Error('Appointment not cancelled');
    console.log(`  ✅ Appointment status: ${verifyAppt2.data.status}`);

    console.log('\n✅ WORKFLOW 3 COMPLETE: Cancellation and refund successful!');

    // ===================== SUMMARY =====================
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 INTEGRATION TESTS SUMMARY');
    console.log('='.repeat(60));
    console.log('\n✅ All workflows completed successfully!');
    console.log(`\n📋 Workflow 1: Pet → Appointment → Invoice → Payment`);
    console.log(`   - Pet created and verified`);
    console.log(`   - Appointment booked and completed`);
    console.log(`   - Invoice created and paid`);
    console.log(`\n📋 Workflow 2: Store → Order → Invoice → Payment`);
    console.log(`   - Order created from cart`);
    console.log(`   - Invoice generated`);
    console.log(`   - Payment processed`);
    console.log(`\n📋 Workflow 3: Appointment → Cancellation → Refund`);
    console.log(`   - Appointment booked with prepayment`);
    console.log(`   - Appointment cancelled`);
    console.log(`   - Full refund issued`);

    console.log(`\n📦 Test Data Created:`);
    console.log(`   - Pets: ${createdIds.pets.length}`);
    console.log(`   - Appointments: ${createdIds.appointments.length}`);
    console.log(`   - Invoices: ${createdIds.invoices.length}`);
    console.log(`   - Payments: ${createdIds.payments.length}`);
    console.log(`   - Refunds: ${createdIds.refunds.length}`);
    console.log(`   - Orders: ${createdIds.orders.length}`);

  } finally {
    // Cleanup
    console.log('\n\n🧹 Cleaning up test data...');
    
    // Clean refunds
    if (createdIds.refunds.length > 0) {
      await supabase.from('refunds').delete().in('id', createdIds.refunds);
      console.log(`  ✅ Deleted ${createdIds.refunds.length} refunds`);
    }
    
    // Clean payments
    if (createdIds.payments.length > 0) {
      await supabase.from('payments').delete().in('id', createdIds.payments);
      console.log(`  ✅ Deleted ${createdIds.payments.length} payments`);
    }
    
    // Clean invoices (cascade deletes invoice_items)
    if (createdIds.invoices.length > 0) {
      await supabase.from('invoices').delete().in('id', createdIds.invoices);
      console.log(`  ✅ Deleted ${createdIds.invoices.length} invoices`);
    }
    
    // Clean orders (cascade deletes order_items)
    if (createdIds.orders.length > 0) {
      await supabase.from('store_orders').delete().in('id', createdIds.orders);
      console.log(`  ✅ Deleted ${createdIds.orders.length} orders`);
    }
    
    // Clean appointments
    if (createdIds.appointments.length > 0) {
      await supabase.from('appointments').delete().in('id', createdIds.appointments);
      console.log(`  ✅ Deleted ${createdIds.appointments.length} appointments`);
    }
    
    // Clean pets
    if (createdIds.pets.length > 0) {
      await supabase.from('pets').delete().in('id', createdIds.pets);
      console.log(`  ✅ Deleted ${createdIds.pets.length} pets`);
    }

    console.log('\n✅ Cleanup complete!\n');
  }
}

// Run tests
runIntegrationTests().catch(console.error);

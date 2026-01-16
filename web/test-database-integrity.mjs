#!/usr/bin/env node
/**
 * Database Integrity Tests
 * 
 * Tests:
 * 1. Foreign key constraint validation
 * 2. Data consistency checks (invoice totals, payment totals)
 * 3. Orphaned record detection
 * 4. Negative value checks (stock, prices)
 * 5. Appointment time conflict detection
 * 6. Required field validation
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🧪 Starting Database Integrity Tests\n');
console.log('='.repeat(60));

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const issues = [];

function logCheck(name, passed, details = '') {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`  ✅ ${name}`);
    if (details) console.log(`     ${details}`);
  } else {
    failedChecks++;
    console.log(`  ❌ ${name}`);
    if (details) console.log(`     ${details}`);
    issues.push({ check: name, details });
  }
}

// ============================================================
// TEST 1: Foreign Key Constraint Validation
// ============================================================
console.log('\n📋 TEST 1: Foreign Key Constraint Validation');
console.log('-'.repeat(60));

try {
  // Check pets have valid owners
  const { data: orphanedPets, error: e1 } = await supabase
    .from('pets')
    .select('id, name, owner_id')
    .is('deleted_at', null);
  
  if (e1) throw e1;
  
  let orphanedCount = 0;
  for (const pet of orphanedPets) {
    const { data: owner } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', pet.owner_id)
      .single();
    
    if (!owner) orphanedCount++;
  }
  
  logCheck(
    'Pets have valid owners',
    orphanedCount === 0,
    orphanedCount === 0 
      ? `All ${orphanedPets.length} pets have valid owners`
      : `Found ${orphanedCount} orphaned pets`
  );

  // Check appointments have valid pets
  const { data: appointments, error: e2 } = await supabase
    .from('appointments')
    .select('id, pet_id')
    .is('deleted_at', null);
  
  if (e2) throw e2;
  
  orphanedCount = 0;
  for (const apt of appointments) {
    const { data: pet } = await supabase
      .from('pets')
      .select('id')
      .eq('id', apt.pet_id)
      .single();
    
    if (!pet) orphanedCount++;
  }
  
  logCheck(
    'Appointments have valid pets',
    orphanedCount === 0,
    orphanedCount === 0 
      ? `All ${appointments.length} appointments have valid pets`
      : `Found ${orphanedCount} orphaned appointments`
  );

  // Check invoices have valid clients
  const { data: invoices, error: e3 } = await supabase
    .from('invoices')
    .select('id, client_id')
    .limit(100);
  
  if (e3) throw e3;
  
  orphanedCount = 0;
  for (const invoice of invoices) {
    const { data: client } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', invoice.client_id)
      .single();
    
    if (!client) orphanedCount++;
  }
  
  logCheck(
    'Invoices have valid clients',
    orphanedCount === 0,
    orphanedCount === 0 
      ? `All ${invoices.length} invoices have valid clients`
      : `Found ${orphanedCount} orphaned invoices`
  );

  // Check payments have valid invoices
  const { data: payments, error: e4 } = await supabase
    .from('payments')
    .select('id, invoice_id')
    .limit(100);
  
  if (e4) throw e4;
  
  orphanedCount = 0;
  for (const payment of payments) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', payment.invoice_id)
      .single();
    
    if (!invoice) orphanedCount++;
  }
  
  logCheck(
    'Payments have valid invoices',
    orphanedCount === 0,
    orphanedCount === 0 
      ? `All ${payments.length} payments have valid invoices`
      : `Found ${orphanedCount} orphaned payments`
  );

} catch (error) {
  console.error('❌ Error in FK validation:', error.message);
  failedChecks++;
}

// ============================================================
// TEST 2: Data Consistency Checks
// ============================================================
console.log('\n📋 TEST 2: Data Consistency Checks');
console.log('-'.repeat(60));

try {
  // Check invoice totals match line items
  const { data: invoicesWithItems, error: e1 } = await supabase
    .from('invoices')
    .select(`
      id, 
      invoice_number, 
      subtotal,
      invoice_items(total)
    `)
    .limit(50);
  
  if (e1) throw e1;
  
  let inconsistentCount = 0;
  for (const invoice of invoicesWithItems) {
    const itemsTotal = invoice.invoice_items.reduce((sum, item) => sum + (item.total || 0), 0);
    const diff = Math.abs(invoice.subtotal - itemsTotal);
    
    // Allow 1 Gs. difference for rounding
    if (diff > 1) {
      inconsistentCount++;
    }
  }
  
  logCheck(
    'Invoice totals match line items',
    inconsistentCount === 0,
    inconsistentCount === 0 
      ? `All ${invoicesWithItems.length} invoices have correct totals`
      : `Found ${inconsistentCount} invoices with total mismatches`
  );

  // Check paid invoices have matching payment totals
  const { data: paidInvoices, error: e2 } = await supabase
    .from('invoices')
    .select(`
      id, 
      invoice_number, 
      total,
      status,
      payments(amount)
    `)
    .eq('status', 'paid')
    .limit(50);
  
  if (e2) throw e2;
  
  inconsistentCount = 0;
  for (const invoice of paidInvoices) {
    const paymentsTotal = invoice.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const diff = Math.abs(invoice.total - paymentsTotal);
    
    // Allow 1 Gs. difference for rounding
    if (diff > 1) {
      inconsistentCount++;
    }
  }
  
  logCheck(
    'Paid invoices have matching payment totals',
    inconsistentCount === 0,
    inconsistentCount === 0 
      ? `All ${paidInvoices.length} paid invoices verified`
      : `Found ${inconsistentCount} invoices with payment mismatches`
  );

} catch (error) {
  console.error('❌ Error in consistency checks:', error.message);
  failedChecks++;
}

// ============================================================
// TEST 3: Negative Value Checks
// ============================================================
console.log('\n📋 TEST 3: Negative Value Checks');
console.log('-'.repeat(60));

try {
  // Check for negative stock quantities
  const { data: negativeStock, error: e1 } = await supabase
    .from('store_inventory')
    .select('product_id, stock_quantity')
    .lt('stock_quantity', 0);
  
  if (e1) throw e1;
  
  logCheck(
    'No negative stock quantities',
    negativeStock.length === 0,
    negativeStock.length === 0 
      ? 'All inventory quantities are non-negative'
      : `Found ${negativeStock.length} products with negative stock`
  );

  // Check for negative prices
  const { data: negativePrices, error: e2 } = await supabase
    .from('store_products')
    .select('id, name, base_price')
    .lt('base_price', 0);
  
  if (e2) throw e2;
  
  logCheck(
    'No negative product prices',
    negativePrices.length === 0,
    negativePrices.length === 0 
      ? 'All products have non-negative prices'
      : `Found ${negativePrices.length} products with negative prices`
  );

  // Check for negative invoice amounts
  const { data: negativeInvoices, error: e3 } = await supabase
    .from('invoices')
    .select('id, invoice_number, total')
    .lt('total', 0);
  
  if (e3) throw e3;
  
  logCheck(
    'No negative invoice totals',
    negativeInvoices.length === 0,
    negativeInvoices.length === 0 
      ? 'All invoices have non-negative totals'
      : `Found ${negativeInvoices.length} invoices with negative totals`
  );

  // Check for negative payment amounts
  const { data: negativePayments, error: e4 } = await supabase
    .from('payments')
    .select('id, payment_number, amount')
    .lt('amount', 0);
  
  if (e4) throw e4;
  
  logCheck(
    'No negative payment amounts',
    negativePayments.length === 0,
    negativePayments.length === 0 
      ? 'All payments have non-negative amounts'
      : `Found ${negativePayments.length} payments with negative amounts`
  );

} catch (error) {
  console.error('❌ Error in negative value checks:', error.message);
  failedChecks++;
}

// ============================================================
// TEST 4: Required Field Validation
// ============================================================
console.log('\n📋 TEST 4: Required Field Validation');
console.log('-'.repeat(60));

try {
  // Check pets have required fields
  const { data: petsNoName, error: e1 } = await supabase
    .from('pets')
    .select('id')
    .or('name.is.null,species.is.null')
    .is('deleted_at', null);
  
  if (e1) throw e1;
  
  logCheck(
    'All pets have name and species',
    petsNoName.length === 0,
    petsNoName.length === 0 
      ? 'All pets have required fields'
      : `Found ${petsNoName.length} pets missing name or species`
  );

  // Check appointments have duration
  const { data: aptsNoDuration, error: e2 } = await supabase
    .from('appointments')
    .select('id')
    .is('duration_minutes', null)
    .is('deleted_at', null);
  
  if (e2) throw e2;
  
  logCheck(
    'All appointments have duration',
    aptsNoDuration.length === 0,
    aptsNoDuration.length === 0 
      ? 'All appointments have duration set'
      : `Found ${aptsNoDuration.length} appointments without duration`
  );

  // Check invoices have invoice_number
  const { data: invoicesNoNumber, error: e3 } = await supabase
    .from('invoices')
    .select('id')
    .is('invoice_number', null);
  
  if (e3) throw e3;
  
  logCheck(
    'All invoices have invoice_number',
    invoicesNoNumber.length === 0,
    invoicesNoNumber.length === 0 
      ? 'All invoices have invoice numbers'
      : `Found ${invoicesNoNumber.length} invoices without numbers`
  );

  // Check payments have payment_number
  const { data: paymentsNoNumber, error: e4 } = await supabase
    .from('payments')
    .select('id')
    .is('payment_number', null);
  
  if (e4) throw e4;
  
  logCheck(
    'All payments have payment_number',
    paymentsNoNumber.length === 0,
    paymentsNoNumber.length === 0 
      ? 'All payments have payment numbers'
      : `Found ${paymentsNoNumber.length} payments without numbers`
  );

} catch (error) {
  console.error('❌ Error in required field validation:', error.message);
  failedChecks++;
}

// ============================================================
// TEST 5: Appointment Time Conflicts
// ============================================================
console.log('\n📋 TEST 5: Appointment Time Conflicts');
console.log('-'.repeat(60));

try {
  // Get active appointments
  const { data: activeAppointments, error: e1 } = await supabase
    .from('appointments')
    .select('id, vet_id, start_time, end_time')
    .in('status', ['scheduled', 'checked_in'])
    .not('vet_id', 'is', null)
    .is('deleted_at', null)
    .order('start_time');
  
  if (e1) throw e1;
  
  // Check for overlaps
  let conflictCount = 0;
  const conflicts = [];
  
  for (let i = 0; i < activeAppointments.length; i++) {
    for (let j = i + 1; j < activeAppointments.length; j++) {
      const apt1 = activeAppointments[i];
      const apt2 = activeAppointments[j];
      
      // Same vet
      if (apt1.vet_id === apt2.vet_id) {
        const start1 = new Date(apt1.start_time);
        const end1 = new Date(apt1.end_time);
        const start2 = new Date(apt2.start_time);
        const end2 = new Date(apt2.end_time);
        
        // Check for overlap
        if (start1 < end2 && start2 < end1) {
          conflictCount++;
          conflicts.push({
            apt1: apt1.id,
            apt2: apt2.id,
            vet: apt1.vet_id
          });
        }
      }
    }
  }
  
  logCheck(
    'No appointment time conflicts',
    conflictCount === 0,
    conflictCount === 0 
      ? `Checked ${activeAppointments.length} active appointments - no conflicts`
      : `Found ${conflictCount} appointment conflicts`
  );

} catch (error) {
  console.error('❌ Error in conflict detection:', error.message);
  failedChecks++;
}

// ============================================================
// TEST 6: Status Consistency Checks
// ============================================================
console.log('\n📋 TEST 6: Status Consistency Checks');
console.log('-'.repeat(60));

try {
  // Check completed appointments have completed_at timestamp
  const { data: completedNoTimestamp, error: e1 } = await supabase
    .from('appointments')
    .select('id')
    .eq('status', 'completed')
    .is('completed_at', null)
    .is('deleted_at', null);
  
  if (e1) throw e1;
  
  logCheck(
    'Completed appointments have completed_at',
    completedNoTimestamp.length === 0,
    completedNoTimestamp.length === 0 
      ? 'All completed appointments have timestamp'
      : `Found ${completedNoTimestamp.length} without completed_at`
  );

  // Check cancelled appointments have cancelled_at timestamp
  const { data: cancelledNoTimestamp, error: e2 } = await supabase
    .from('appointments')
    .select('id')
    .eq('status', 'cancelled')
    .is('cancelled_at', null)
    .is('deleted_at', null);
  
  if (e2) throw e2;
  
  logCheck(
    'Cancelled appointments have cancelled_at',
    cancelledNoTimestamp.length === 0,
    cancelledNoTimestamp.length === 0 
      ? 'All cancelled appointments have timestamp'
      : `Found ${cancelledNoTimestamp.length} without cancelled_at`
  );

  // Check refunded invoices have refund records via payments
  const { data: refundedInvoices, error: e3 } = await supabase
    .from('invoices')
    .select(`
      id, 
      invoice_number,
      payments(
        id,
        refunds:refunds(id)
      )
    `)
    .eq('status', 'refunded')
    .limit(50);
  
  if (e3) throw e3;
  
  let noRefundCount = 0;
  for (const invoice of refundedInvoices) {
    let hasRefund = false;
    if (invoice.payments) {
      for (const payment of invoice.payments) {
        if (payment.refunds && payment.refunds.length > 0) {
          hasRefund = true;
          break;
        }
      }
    }
    if (!hasRefund) noRefundCount++;
  }
  
  logCheck(
    'Refunded invoices have refund records',
    noRefundCount === 0,
    noRefundCount === 0 
      ? `All ${refundedInvoices.length} refunded invoices have refunds`
      : `Found ${noRefundCount} refunded invoices without refund records`
  );

} catch (error) {
  console.error('❌ Error in status consistency checks:', error.message);
  failedChecks++;
}

// ============================================================
// Summary
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('📊 DATABASE INTEGRITY TEST SUMMARY');
console.log('='.repeat(60));

console.log(`\n✅ Passed: ${passedChecks}/${totalChecks}`);
console.log(`❌ Failed: ${failedChecks}/${totalChecks}`);

if (issues.length > 0) {
  console.log('\n🚨 ISSUES FOUND:');
  issues.forEach((issue, idx) => {
    console.log(`\n${idx + 1}. ${issue.check}`);
    if (issue.details) {
      console.log(`   ${issue.details}`);
    }
  });
}

if (failedChecks === 0) {
  console.log('\n✅ All database integrity checks passed!');
  console.log('\n📊 Database State:');
  console.log('   ✓ All foreign key constraints valid');
  console.log('   ✓ Data consistency verified');
  console.log('   ✓ No negative values found');
  console.log('   ✓ Required fields present');
  console.log('   ✓ No appointment conflicts');
  console.log('   ✓ Status consistency maintained');
  process.exit(0);
} else {
  console.log('\n❌ Database integrity issues detected!');
  console.log('   Review the issues above and fix inconsistencies.');
  process.exit(1);
}

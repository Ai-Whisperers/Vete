/**
 * RLS Audit Script
 * 
 * Run this script to audit all tables for proper Row-Level Security policies.
 * This is a critical security check to prevent data leakage between tenants.
 * 
 * Usage: npx tsx scripts/rls-audit.ts
 * 
 * Output: List of tables missing policies or with weak policies
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PolicyIssue {
  table: string
  issue: string
  severity: 'critical' | 'high' | 'medium'
}

async function auditRLS(): Promise<PolicyIssue[]> {
  const issues: PolicyIssue[] = []

  // Get all tables
  const { data: tables, error } = await supabase.rpc('get_tables')
  
  if (error) {
    console.error('Error fetching tables:', error.message)
    // Fallback: query information_schema
    const { data: fallbackTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
    
    if (fallbackTables) {
      for (const t of fallbackTables) {
        await checkTable(t.table_name, issues)
      }
    }
    return issues
  }

  for (const table of tables || []) {
    await checkTable(table, issues)
  }

  return issues
}

async function checkTable(tableName: string, issues: PolicyIssue[]): Promise<void> {
  // Check if RLS is enabled
  const { data: rlsEnabled } = await supabase
    .from('pg_tables')
    .select('rowsecurity')
    .eq('tablename', tableName)
    .single()

  if (!rlsEnabled?.rowsecurity) {
    issues.push({
      table: tableName,
      issue: 'Row-Level Security is NOT enabled',
      severity: 'critical'
    })
    return
  }

  // Get policies for this table
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('policyname, cmd, qual, with_check')
    .eq('tablename', tableName)

  if (!policies || policies.length === 0) {
    issues.push({
      table: tableName,
      issue: 'No RLS policies defined',
      severity: 'critical'
    })
    return
  }

  // Check for tenant isolation policies
  const hasTenantPolicy = policies.some(p => 
    p.qual?.toString().includes('tenant_id') || 
    p.with_check?.toString().includes('tenant_id')
  )

  const hasStaffPolicy = policies.some(p =>
    p.policyname?.toString().includes('staff') ||
    p.qual?.toString().includes('is_staff_of')
  )

  // Check for dangerous "SELECT * FROM table" without tenant check
  const hasPublicSelect = policies.some(p => 
    p.cmd === 'SELECT' && (!p.qual || p.qual === 'true')
  )

  if (hasPublicSelect && hasTenantPolicy) {
    issues.push({
      table: tableName,
      issue: 'Has public SELECT policy - verify it includes tenant check',
      severity: 'high'
    })
  }

  if (!hasTenantPolicy && tableName !== 'tenants') {
    issues.push({
      table: tableName,
      issue: 'No tenant_id filter in policies',
      severity: 'critical'
    })
  }
}

async function main() {
  console.log('🔍 Starting RLS Audit...\n')
  
  const issues = await auditRLS()

  if (issues.length === 0) {
    console.log('✅ All tables have proper RLS policies!')
    return
  }

  // Group by severity
  const critical = issues.filter(i => i.severity === 'critical')
  const high = issues.filter(i => i.severity === 'high')
  const medium = issues.filter(i => i.severity === 'medium')

  console.log(`Found ${issues.length} issues:\n`)
  
  if (critical.length > 0) {
    console.log('🚨 CRITICAL (must fix immediately):')
    critical.forEach(i => console.log(`  - ${i.table}: ${i.issue}`))
    console.log()
  }

  if (high.length > 0) {
    console.log('⚠️  HIGH (should fix):')
    high.forEach(i => console.log(`  - ${i.table}: ${i.issue}`))
    console.log()
  }

  if (medium.length > 0) {
    console.log('📝 MEDIUM (review):')
    medium.forEach(i => console.log(`  - ${i.table}: ${i.issue}`))
  }

  // Exit with error code if critical issues found
  if (critical.length > 0) {
    console.log('\n❌ Critical issues found! Fix before deploying to production.')
    process.exit(1)
  }
}

main().catch(console.error)

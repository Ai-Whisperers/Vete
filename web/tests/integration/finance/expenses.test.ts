/**
 * Integration Tests: Finance - Expenses CRUD
 *
 * Tests expense tracking and financial management.
 * @tags integration, finance, high
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getTestClient, TestContext, waitForDatabase } from '../../__helpers__/db'
import { createProfile, resetSequence } from '../../__helpers__/factories'
import { DEFAULT_TENANT } from '../../__fixtures__/tenants'

describe('Finance - Expenses CRUD', () => {
  const ctx = new TestContext()
  let client: ReturnType<typeof getTestClient>
  let adminId: string

  beforeAll(async () => {
    await waitForDatabase()
    client = getTestClient()

    // Create test admin who can manage expenses
    const admin = await createProfile({
      tenantId: DEFAULT_TENANT.id,
      role: 'admin',
      fullName: 'Finance Admin',
    })
    adminId = admin.id
    ctx.track('profiles', adminId)
  })

  afterAll(async () => {
    await ctx.cleanup()
  })

  beforeEach(() => {
    resetSequence()
  })

  describe('CREATE', () => {
    test('creates basic expense', async () => {
      const { data, error } = await client
        .from('expenses')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          description: 'Compra de medicamentos',
          amount: 500000,
          category: 'Inventario',
          date: new Date().toISOString().split('T')[0],
          created_by: adminId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.description).toBe('Compra de medicamentos')
      expect(data.amount).toBe(500000)
      expect(data.category).toBe('Inventario')

      ctx.track('expenses', data.id)
    })

    test('creates expense with all fields', async () => {
      const { data, error } = await client
        .from('expenses')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          description: 'Pago de alquiler mensual',
          amount: 3000000,
          category: 'Local',
          date: new Date().toISOString().split('T')[0],
          payment_method: 'transferencia',
          vendor: 'Inmobiliaria ABC',
          invoice_number: 'FAC-2024-001',
          notes: 'Pago correspondiente a diciembre 2024',
          created_by: adminId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.payment_method).toBe('transferencia')
      expect(data.vendor).toBe('Inmobiliaria ABC')
      expect(data.invoice_number).toBe('FAC-2024-001')

      ctx.track('expenses', data.id)
    })

    test('creates expenses in different categories', async () => {
      const categories = [
        'Inventario',
        'Salarios',
        'Servicios',
        'Local',
        'Marketing',
        'Equipamiento',
        'Otros',
      ]

      for (const category of categories) {
        const { data, error } = await client
          .from('expenses')
          .insert({
            tenant_id: DEFAULT_TENANT.id,
            description: `Gasto de ${category}`,
            amount: 100000,
            category,
            date: new Date().toISOString().split('T')[0],
            created_by: adminId,
          })
          .select()
          .single()

        expect(error).toBeNull()
        expect(data.category).toBe(category)
        ctx.track('expenses', data.id)
      }
    })

    test('creates recurring expense', async () => {
      const { data, error } = await client
        .from('expenses')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          description: 'Servicio de Internet',
          amount: 250000,
          category: 'Servicios',
          date: new Date().toISOString().split('T')[0],
          is_recurring: true,
          recurrence_interval: 'monthly',
          created_by: adminId,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.is_recurring).toBe(true)
      expect(data.recurrence_interval).toBe('monthly')

      ctx.track('expenses', data.id)
    })

    test('fails without amount', async () => {
      const { error } = await client.from('expenses').insert({
        tenant_id: DEFAULT_TENANT.id,
        description: 'Missing amount',
        category: 'Otros',
        date: new Date().toISOString().split('T')[0],
      })

      expect(error).not.toBeNull()
    })

    test('fails without description', async () => {
      const { error } = await client.from('expenses').insert({
        tenant_id: DEFAULT_TENANT.id,
        amount: 100000,
        category: 'Otros',
        date: new Date().toISOString().split('T')[0],
      })

      expect(error).not.toBeNull()
    })
  })

  describe('READ', () => {
    let expenseId: string

    beforeAll(async () => {
      const { data } = await client
        .from('expenses')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          description: 'Read Test Expense',
          amount: 150000,
          category: 'Otros',
          date: new Date().toISOString().split('T')[0],
          created_by: adminId,
        })
        .select()
        .single()
      expenseId = data.id
      ctx.track('expenses', expenseId)
    })

    test('reads expense by ID', async () => {
      const { data, error } = await client.from('expenses').select('*').eq('id', expenseId).single()

      expect(error).toBeNull()
      expect(data.description).toBe('Read Test Expense')
    })

    test('reads expenses by tenant', async () => {
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)

      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data!.length).toBeGreaterThan(0)
    })

    test('filters expenses by category', async () => {
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .eq('category', 'Inventario')

      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect(data!.every((e: { category: string }) => e.category === 'Inventario')).toBe(true)
    })

    test('filters expenses by date range', async () => {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      const endDate = new Date()

      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      expect(error).toBeNull()
    })

    test('orders expenses by date', async () => {
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .order('date', { ascending: false })

      expect(error).toBeNull()
      expect(data).not.toBeNull()
      // Verify descending order
      for (let i = 1; i < data!.length; i++) {
        expect(new Date(data![i].date).getTime()).toBeLessThanOrEqual(
          new Date(data![i - 1].date).getTime()
        )
      }
    })

    test('paginates expenses', async () => {
      const { data: page1, error: error1 } = await client
        .from('expenses')
        .select('*')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .range(0, 4)

      expect(error1).toBeNull()
      expect(page1).not.toBeNull()
      expect(page1!.length).toBeLessThanOrEqual(5)
    })
  })

  describe('UPDATE', () => {
    let updateExpenseId: string

    beforeAll(async () => {
      const { data } = await client
        .from('expenses')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          description: 'Update Test Expense',
          amount: 200000,
          category: 'Otros',
          date: new Date().toISOString().split('T')[0],
          created_by: adminId,
        })
        .select()
        .single()
      updateExpenseId = data.id
      ctx.track('expenses', updateExpenseId)
    })

    test('updates amount', async () => {
      const { data, error } = await client
        .from('expenses')
        .update({ amount: 250000 })
        .eq('id', updateExpenseId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.amount).toBe(250000)
    })

    test('updates category', async () => {
      const { data, error } = await client
        .from('expenses')
        .update({ category: 'Servicios' })
        .eq('id', updateExpenseId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.category).toBe('Servicios')
    })

    test('updates notes', async () => {
      const { data, error } = await client
        .from('expenses')
        .update({ notes: 'Updated expense notes' })
        .eq('id', updateExpenseId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.notes).toBe('Updated expense notes')
    })

    test('updates payment method', async () => {
      const { data, error } = await client
        .from('expenses')
        .update({ payment_method: 'efectivo' })
        .eq('id', updateExpenseId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.payment_method).toBe('efectivo')
    })
  })

  describe('DELETE', () => {
    test('deletes expense by ID', async () => {
      // Create expense to delete
      const { data: created } = await client
        .from('expenses')
        .insert({
          tenant_id: DEFAULT_TENANT.id,
          description: 'To Delete Expense',
          amount: 50000,
          category: 'Otros',
          date: new Date().toISOString().split('T')[0],
          created_by: adminId,
        })
        .select()
        .single()

      // Delete it
      const { error } = await client.from('expenses').delete().eq('id', created.id)

      expect(error).toBeNull()

      // Verify deleted
      const { data: found } = await client
        .from('expenses')
        .select('*')
        .eq('id', created.id)
        .single()

      expect(found).toBeNull()
    })
  })

  describe('FINANCIAL REPORTS', () => {
    test('calculates total expenses by period', async () => {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)

      const { data, error } = await client
        .from('expenses')
        .select('amount')
        .eq('tenant_id', DEFAULT_TENANT.id)
        .gte('date', startDate.toISOString().split('T')[0])

      expect(error).toBeNull()
      expect(data).not.toBeNull()

      const total = data!.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

      expect(typeof total).toBe('number')
    })

    test('groups expenses by category', async () => {
      const { data, error } = await client
        .from('expenses')
        .select('category, amount')
        .eq('tenant_id', DEFAULT_TENANT.id)

      expect(error).toBeNull()
      expect(data).not.toBeNull()

      const byCategory = data!.reduce(
        (acc: Record<string, number>, e: { category: string; amount: number }) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount
          return acc
        },
        {}
      )

      expect(Object.keys(byCategory).length).toBeGreaterThan(0)
    })

    test('calculates monthly expense totals', async () => {
      const { data, error } = await client
        .from('expenses')
        .select('date, amount')
        .eq('tenant_id', DEFAULT_TENANT.id)

      expect(error).toBeNull()
      expect(data).not.toBeNull()

      const byMonth = data!.reduce(
        (acc: Record<string, number>, e: { date: string; amount: number }) => {
          const month = e.date.substring(0, 7) // YYYY-MM
          acc[month] = (acc[month] || 0) + e.amount
          return acc
        },
        {}
      )

      expect(typeof byMonth).toBe('object')
    })

    test('finds top expense categories', async () => {
      const { data, error } = await client
        .from('expenses')
        .select('category, amount')
        .eq('tenant_id', DEFAULT_TENANT.id)

      expect(error).toBeNull()
      expect(data).not.toBeNull()

      const categoryTotals = data!.reduce(
        (acc: Record<string, number>, e: { category: string; amount: number }) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount
          return acc
        },
        {}
      )

      const sorted = Object.entries(categoryTotals).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )

      expect(Array.isArray(sorted)).toBe(true)
    })
  })

  describe('MULTI-TENANT ISOLATION', () => {
    test('expenses are isolated by tenant', async () => {
      // Create expense in petlife
      const { data: petlifeExpense } = await client
        .from('expenses')
        .insert({
          tenant_id: 'petlife',
          description: 'PetLife Only Expense',
          amount: 999999,
          category: 'Otros',
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single()
      ctx.track('expenses', petlifeExpense.id)

      // Query adris expenses
      const { data: adrisExpenses } = await client
        .from('expenses')
        .select('*')
        .eq('tenant_id', 'adris')

      // Query petlife expenses
      const { data: petlifeExpenses } = await client
        .from('expenses')
        .select('*')
        .eq('tenant_id', 'petlife')

      // Verify isolation
      expect(adrisExpenses).not.toBeNull()
      expect(petlifeExpenses).not.toBeNull()
      expect(adrisExpenses!.some((e: { id: string }) => e.id === petlifeExpense.id)).toBe(false)
      expect(petlifeExpenses!.some((e: { id: string }) => e.id === petlifeExpense.id)).toBe(true)
    })
  })
})

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

// TICKET-TYPE-005: Type definitions for revenue analytics
interface PaymentsByMethod {
  [method: string]: number
}

interface MonthlyRevenue {
  total: number
  count: number
  by_method: PaymentsByMethod
}

interface GroupedPayments {
  [month: string]: MonthlyRevenue
}

// GET /api/dashboard/revenue - Get revenue analytics
export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return apiError('UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  const { searchParams } = new URL(request.url)
  const months = parseInt(searchParams.get('months') || '6')

  try {
    // Try materialized view first
    const { data: revenue, error } = await supabase
      .from('mv_revenue_analytics')
      .select('period_month, total_revenue, transaction_count, avg_transaction, by_payment_method')
      .eq('tenant_id', profile.tenant_id)
      .order('period_month', { ascending: false })
      .limit(months)

    if (error) {
      // Fallback to live query
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_method, paid_at')
        .eq('tenant_id', profile.tenant_id)
        .gte('paid_at', startDate.toISOString())
        .order('paid_at', { ascending: true })

      // Group by month - TICKET-TYPE-005: Use proper types instead of any
      const grouped = payments?.reduce<GroupedPayments>((acc, payment) => {
        const month = payment.paid_at.substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { total: 0, count: 0, by_method: {} }
        }
        acc[month].total += payment.amount
        acc[month].count++
        acc[month].by_method[payment.payment_method] =
          (acc[month].by_method[payment.payment_method] || 0) + payment.amount
        return acc
      }, {})

      const result = Object.entries(grouped || {}).map(
        ([month, data]: [string, MonthlyRevenue]) => ({
          period_month: month,
          total_revenue: data.total,
          transaction_count: data.count,
          avg_transaction: data.count > 0 ? (data.total / data.count).toFixed(0) : 0,
          by_payment_method: data.by_method,
        })
      )

      return NextResponse.json(result)
    }

    return NextResponse.json(revenue)
  } catch (e) {
    console.error('Error loading revenue analytics:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: e instanceof Error ? e.message : 'Unknown error' },
    })
  }
}

import { NextResponse } from 'next/server'
import { withApiAuth, type ApiHandlerContext } from '@/lib/auth'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'
import { logger } from '@/lib/logger'

interface CustomerSegment {
  segment: 'vip' | 'regular' | 'at_risk' | 'dormant' | 'new'
  count: number
  total_revenue: number
  avg_order_value: number
  percentage: number
}

interface CustomerMetrics {
  id: string
  name: string
  email: string
  segment: CustomerSegment['segment']
  total_orders: number
  total_spent: number
  avg_order_value: number
  first_order_date: string | null
  last_order_date: string | null
  days_since_last_order: number | null
  loyalty_points: number
}

interface PurchaseFrequency {
  frequency: string
  count: number
  percentage: number
}

interface CustomerSummary {
  total_customers: number
  active_customers: number
  new_customers_period: number
  repeat_purchase_rate: number
  avg_customer_lifetime_value: number
  avg_orders_per_customer: number
  avg_basket_size: number
}

/**
 * GET /api/analytics/customers
 * Get customer purchase analytics and segmentation
 */
export const GET = withApiAuth(
  async ({ request, user, profile, supabase }: ApiHandlerContext) => {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '90', 10)

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - period)
      const startDateStr = startDate.toISOString()

      // Get all orders with customer info
      const { data: orders, error: ordersError } = await supabase
        .from('store_orders')
        .select('id, user_id, total, created_at, status')
        .eq('tenant_id', profile.tenant_id)
        .in('status', ['delivered', 'shipped', 'confirmed', 'processing', 'pending'])

      if (ordersError) throw ordersError

      // Get customer profiles
      const customerIds = [...new Set((orders || []).map((o) => o.user_id).filter(Boolean))]

      const { data: customers, error: customersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', customerIds.length > 0 ? customerIds : ['00000000-0000-0000-0000-000000000000'])

      if (customersError) throw customersError

      // Get loyalty points
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('loyalty_points')
        .select('client_id, balance')
        .eq('tenant_id', profile.tenant_id)

      if (loyaltyError) throw loyaltyError

      const loyaltyMap: Record<string, number> = {}
      for (const lp of loyaltyData || []) {
        loyaltyMap[lp.client_id] = lp.balance
      }

      // Build customer map
      const customerMap: Record<
        string,
        {
          id: string
          name: string
          email: string
          orders: Array<{ total: number; created_at: string }>
        }
      > = {}

      for (const customer of customers || []) {
        customerMap[customer.id] = {
          id: customer.id,
          name: customer.full_name || 'Sin nombre',
          email: customer.email || '',
          orders: [],
        }
      }

      for (const order of orders || []) {
        if (order.user_id && customerMap[order.user_id]) {
          customerMap[order.user_id].orders.push({
            total: order.total,
            created_at: order.created_at,
          })
        }
      }

      // Calculate metrics for each customer
      const now = new Date()
      const customerMetrics: CustomerMetrics[] = []
      const segmentCounts: Record<
        CustomerSegment['segment'],
        { count: number; revenue: number; orderValue: number }
      > = {
        vip: { count: 0, revenue: 0, orderValue: 0 },
        regular: { count: 0, revenue: 0, orderValue: 0 },
        at_risk: { count: 0, revenue: 0, orderValue: 0 },
        dormant: { count: 0, revenue: 0, orderValue: 0 },
        new: { count: 0, revenue: 0, orderValue: 0 },
      }

      const frequencyBuckets: Record<string, number> = {
        weekly: 0,
        biweekly: 0,
        monthly: 0,
        quarterly: 0,
        yearly: 0,
        infrequent: 0,
      }

      let totalCustomers = 0
      let activeCustomers = 0
      let newCustomersPeriod = 0
      let repeatCustomers = 0
      let totalRevenue = 0
      let totalOrders = 0

      for (const customer of Object.values(customerMap)) {
        if (customer.orders.length === 0) continue

        totalCustomers++

        const orderDates = customer.orders
          .map((o) => new Date(o.created_at))
          .sort((a, b) => a.getTime() - b.getTime())
        const firstOrderDate = orderDates[0]
        const lastOrderDate = orderDates[orderDates.length - 1]
        const daysSinceLastOrder = Math.floor(
          (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        const totalSpent = customer.orders.reduce((sum, o) => sum + o.total, 0)
        const avgOrderValue = totalSpent / customer.orders.length

        totalRevenue += totalSpent
        totalOrders += customer.orders.length

        if (customer.orders.length > 1) {
          repeatCustomers++
        }

        if (lastOrderDate >= new Date(startDateStr)) {
          activeCustomers++
        }

        if (firstOrderDate >= new Date(startDateStr)) {
          newCustomersPeriod++
        }

        // Determine segment
        let segment: CustomerSegment['segment']
        if (totalSpent >= 2000000 || customer.orders.length >= 10) {
          segment = 'vip'
        } else if (daysSinceLastOrder <= 30 && customer.orders.length >= 2) {
          segment = 'regular'
        } else if (daysSinceLastOrder > 60 && daysSinceLastOrder <= 120) {
          segment = 'at_risk'
        } else if (daysSinceLastOrder > 120) {
          segment = 'dormant'
        } else if (customer.orders.length === 1 && daysSinceLastOrder <= 30) {
          segment = 'new'
        } else {
          segment = 'regular'
        }

        segmentCounts[segment].count++
        segmentCounts[segment].revenue += totalSpent
        segmentCounts[segment].orderValue += avgOrderValue

        // Calculate purchase frequency
        if (customer.orders.length >= 2) {
          const daysBetweenOrders =
            (lastOrderDate.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)
          const avgDaysBetween = daysBetweenOrders / (customer.orders.length - 1)

          if (avgDaysBetween <= 7) {
            frequencyBuckets.weekly++
          } else if (avgDaysBetween <= 14) {
            frequencyBuckets.biweekly++
          } else if (avgDaysBetween <= 30) {
            frequencyBuckets.monthly++
          } else if (avgDaysBetween <= 90) {
            frequencyBuckets.quarterly++
          } else if (avgDaysBetween <= 365) {
            frequencyBuckets.yearly++
          } else {
            frequencyBuckets.infrequent++
          }
        }

        customerMetrics.push({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          segment,
          total_orders: customer.orders.length,
          total_spent: totalSpent,
          avg_order_value: Math.round(avgOrderValue),
          first_order_date: firstOrderDate.toISOString(),
          last_order_date: lastOrderDate.toISOString(),
          days_since_last_order: daysSinceLastOrder,
          loyalty_points: loyaltyMap[customer.id] || 0,
        })
      }

      // Sort by total spent
      customerMetrics.sort((a, b) => b.total_spent - a.total_spent)

      // Build segment distribution
      const segments: CustomerSegment[] = Object.entries(segmentCounts).map(([segment, data]) => ({
        segment: segment as CustomerSegment['segment'],
        count: data.count,
        total_revenue: data.revenue,
        avg_order_value: data.count > 0 ? Math.round(data.orderValue / data.count) : 0,
        percentage: totalCustomers > 0 ? Math.round((data.count / totalCustomers) * 100) : 0,
      }))

      // Build frequency distribution
      const frequencyTotal = Object.values(frequencyBuckets).reduce((a, b) => a + b, 0)
      const purchaseFrequency: PurchaseFrequency[] = [
        {
          frequency: 'Semanal',
          count: frequencyBuckets.weekly,
          percentage: frequencyTotal > 0 ? Math.round((frequencyBuckets.weekly / frequencyTotal) * 100) : 0,
        },
        {
          frequency: 'Quincenal',
          count: frequencyBuckets.biweekly,
          percentage: frequencyTotal > 0 ? Math.round((frequencyBuckets.biweekly / frequencyTotal) * 100) : 0,
        },
        {
          frequency: 'Mensual',
          count: frequencyBuckets.monthly,
          percentage: frequencyTotal > 0 ? Math.round((frequencyBuckets.monthly / frequencyTotal) * 100) : 0,
        },
        {
          frequency: 'Trimestral',
          count: frequencyBuckets.quarterly,
          percentage: frequencyTotal > 0 ? Math.round((frequencyBuckets.quarterly / frequencyTotal) * 100) : 0,
        },
        {
          frequency: 'Anual',
          count: frequencyBuckets.yearly,
          percentage: frequencyTotal > 0 ? Math.round((frequencyBuckets.yearly / frequencyTotal) * 100) : 0,
        },
        {
          frequency: 'Infrecuente',
          count: frequencyBuckets.infrequent,
          percentage: frequencyTotal > 0 ? Math.round((frequencyBuckets.infrequent / frequencyTotal) * 100) : 0,
        },
      ]

      const summary: CustomerSummary = {
        total_customers: totalCustomers,
        active_customers: activeCustomers,
        new_customers_period: newCustomersPeriod,
        repeat_purchase_rate: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
        avg_customer_lifetime_value: totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0,
        avg_orders_per_customer: totalCustomers > 0 ? Math.round((totalOrders / totalCustomers) * 10) / 10 : 0,
        avg_basket_size: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      }

      return NextResponse.json({
        summary,
        segments,
        purchaseFrequency,
        topCustomers: customerMetrics.slice(0, 20),
        atRiskCustomers: customerMetrics
          .filter((c) => c.segment === 'at_risk' || c.segment === 'dormant')
          .slice(0, 20),
        generatedAt: new Date().toISOString(),
      })
    } catch (e) {
      logger.error('Error fetching customer analytics', {
        tenantId: profile.tenant_id,
        userId: user.id,
        error: e instanceof Error ? e.message : 'Unknown',
      })
      return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  },
  { roles: ['vet', 'admin'] }
)

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiError, HTTP_STATUS } from '@/lib/api/errors'

// TICKET-TYPE-005: Type definitions for appointment analytics
interface DailyStats {
  total: number
  completed: number
  cancelled: number
  no_show: number
}

interface GroupedAppointments {
  [date: string]: DailyStats
}

// GET /api/dashboard/appointments - Get appointment analytics
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

  if (!profile || !['vet', 'admin'].includes(profile.role)) {
    return apiError('INSUFFICIENT_ROLE', HTTP_STATUS.FORBIDDEN)
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'month' // day, week, month

  try {
    // Try materialized view first
    const { data: analytics, error } = await supabase
      .from('mv_appointment_analytics')
      .select('*')
      .eq('tenant_id', profile.tenant_id)
      .order('period_start', { ascending: false })
      .limit(30)

    if (error) {
      // Fallback to live query
      const now = new Date()
      const startDate = new Date()

      if (period === 'day') {
        startDate.setDate(now.getDate() - 7)
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 28)
      } else {
        startDate.setMonth(now.getMonth() - 6)
      }

      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, status, start_time, reason')
        .eq('tenant_id', profile.tenant_id)
        .gte('start_time', startDate.toISOString())
        .order('start_time', { ascending: true })

      // Group by date - TICKET-TYPE-005: Use proper types instead of any
      const grouped = appointments?.reduce<GroupedAppointments>((acc, apt) => {
        const date = apt.start_time.split('T')[0]
        if (!acc[date]) {
          acc[date] = { total: 0, completed: 0, cancelled: 0, no_show: 0 }
        }
        acc[date].total++
        if (apt.status === 'completed') acc[date].completed++
        if (apt.status === 'cancelled') acc[date].cancelled++
        if (apt.status === 'no_show') acc[date].no_show++
        return acc
      }, {})

      const result = Object.entries(grouped || {}).map(([date, stats]) => ({
        period_start: date,
        total_appointments: stats.total,
        completed: stats.completed,
        cancelled: stats.cancelled,
        no_shows: stats.no_show,
        completion_rate: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0,
      }))

      return NextResponse.json(result)
    }

    return NextResponse.json(analytics)
  } catch (e) {
    console.error('Error loading appointment analytics:', e)
    return apiError('DATABASE_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      details: { message: e instanceof Error ? e.message : 'Unknown error' },
    })
  }
}

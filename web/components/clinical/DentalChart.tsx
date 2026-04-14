'use client'

import { useEffect, useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, TrendingUp, Info, Loader2, AlertCircle } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { queryKeys } from '@/lib/queries'
import { staleTimes, gcTimes } from '@/lib/queries/utils'

interface Tooth {
  id: number
  condition: string
  procedure: string
}

interface DentalChartProps {
  petId: number
}

export function DentalChart({ petId }: DentalChartProps) {
  const { t } = useTranslations('clinical')
  const locale = useLocale()

  const { data, error, isLoading } = useQuery(
    queryKeys.dentalChart(petId),
    async () => {
      const response = await fetch(`/api/pets/${petId}/dental-chart`)
      return response.json()
    },
    {
      staleTime: staleTimes.short,
      gc: gcTimes.short,
    }
  )

  if (isLoading) {
    return <Loader2 />
  }

  if (error) {
    return <AlertCircle /> {t('error.loadingDentalChart')}
  }

  const teeth: Tooth[] = data.teeth

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <h3 className="mb-4 text-sm font-medium text-[var(--text-primary)]">
        {t('dentalChart.title')}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={teeth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="id" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="condition" stroke="#8884d8" />
          <Line type="monotone" dataKey="procedure" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>{t('dentalChart.tooth')}</th>
            <th>{t('dentalChart.condition')}</th>
            <th>{t('dentalChart.procedure')}</th>
          </tr>
        </thead>
        <tbody>
          {teeth.map((tooth) => (
            <tr key={tooth.id}>
              <td>{tooth.id}</td>
              <td>{tooth.condition}</td>
              <td>{tooth.procedure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
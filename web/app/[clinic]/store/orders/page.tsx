'use client'

import { getClinicData } from '@/lib/clinics'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import for code splitting
const OrderHistoryClient = dynamic(() => import('./client'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
})

export const generateMetadata = async ({ params }: { params: Promise<{ clinic: string }> }) => {
  const { clinic } = await params
  const data = await getClinicData(clinic)
  return {
    title: `Mis Pedidos - ${data?.config.name || 'Tienda'}`,
    description: 'Historial de pedidos y seguimiento',
  }
}

interface Props {
  params: Promise<{ clinic: string }>
}

export default async function OrderHistoryPage({ params }: Props) {
  const { clinic } = await params
  const data = await getClinicData(clinic)

  if (!data) {
    notFound()
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <OrderHistoryClient config={data.config} />
    </Suspense>
  )
}

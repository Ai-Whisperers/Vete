'use client'

import { requireStaff } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { getClinicData } from '@/lib/clinics'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import for code splitting
const LostPetDetailClient = dynamic(() => import('./client'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
})

interface Props {
  params: Promise<{ clinic: string; id: string }>
}

export async function generateStaticParams(): Promise<Array<{ clinic: string; id: string }>> {
  // Dynamic pages - no static params needed
  return []
}

export default async function LostPetDetailPage({ params }: Props): Promise<React.ReactElement> {
  const { clinic, id } = await params

  // SEC-006: Require staff authentication with tenant verification
  await requireStaff(clinic)

  const clinicData = await getClinicData(clinic)

  if (!clinicData) {
    notFound()
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <LostPetDetailClient clinic={clinic} reportId={id} />
    </Suspense>
  )
}

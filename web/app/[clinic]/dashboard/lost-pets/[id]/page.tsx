import { requireStaff } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { getClinicData } from '@/lib/clinics'

// Dynamic import for code splitting
import LostPetDetailClient from './client'

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
    
  )
}

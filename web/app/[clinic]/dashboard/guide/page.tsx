import { getClinicData } from '@/lib/clinics'
import { notFound } from 'next/navigation'
import { requireStaff } from '@/lib/auth'

interface Props {
  params: Promise<{ clinic: string }>
}

export async function generateMetadata({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)
  if (!clinicData) return {}
  return {
    title: `Guía de Onboarding - ${clinicData.config.name}`,
  }
}

export default async function GuidePage({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)
  if (!clinicData) notFound()

  await requireStaff(clinic)

  return <GuideClient clinic={clinic} clinicName={clinicData.config.name} />
}

import { GuideClient } from './guide-client'

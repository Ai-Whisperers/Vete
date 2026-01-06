import { getClinicData } from '@/lib/clinics'
import { notFound } from 'next/navigation'
import { AdoptionsManagement } from './client'

interface Props {
  params: Promise<{ clinic: string }>
}

export async function generateStaticParams() {
  return [{ clinic: 'adris' }, { clinic: 'petlife' }]
}

export async function generateMetadata({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)

  if (!clinicData) return {}

  return {
    title: `Gestión de Adopciones | ${clinicData.config.name}`,
    description: 'Administrar listados de adopción y solicitudes',
  }
}

export default async function AdoptionsDashboardPage({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)

  if (!clinicData) {
    notFound()
  }

  return <AdoptionsManagement clinicSlug={clinic} />
}

import { getClinicData } from '@/lib/clinics'
import { notFound } from 'next/navigation'
import { AdoptionBoard } from './client'

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
    title: `Adopciones | ${clinicData.config.name}`,
    description: 'Encuentra a tu próximo compañero peludo. Mascotas disponibles para adopción.',
  }
}

export default async function AdoptionsPage({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)

  if (!clinicData) {
    notFound()
  }

  return <AdoptionBoard clinicSlug={clinic} clinicConfig={clinicData.config} />
}

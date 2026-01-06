import { getClinicData } from '@/lib/clinics'
import { notFound } from 'next/navigation'
import { LostFoundBoard } from './client'

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
    title: `Mascotas Perdidas | ${clinicData.config.name}`,
    description: 'Tablero de mascotas perdidas y encontradas',
  }
}

export default async function LostFoundPage({ params }: Props) {
  const { clinic } = await params
  const clinicData = await getClinicData(clinic)

  if (!clinicData) {
    notFound()
  }

  return <LostFoundBoard clinicSlug={clinic} clinicConfig={clinicData.config} />
}

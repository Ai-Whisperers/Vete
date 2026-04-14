import { getClinicData, getAllClinics } from '@/lib/clinics'
import { notFound } from 'next/navigation'
import { ClinicLayout } from '@/components/clinic/ClinicLayout'

interface Props {
  params: Promise<{ clinic: string }>
}

export async function generateStaticParams() {
  const clinics = await getAllClinics()
  return clinics.map((clinic) => ({ clinic }))
}

export async function generateMetadata({ params }: Props) {
  const { clinic } = await params
  const data = await getClinicData(clinic)
  
  if (!data) return {}
  
  return {
    title: `${data.config.name} - ${data.config.tagline}`,
    description: data.home.seo?.meta_description,
  }
}

export default async function DayahPage({ params }: Props) {
  const { clinic } = await params
  const data = await getClinicData(clinic)
  
  if (!data) {
    notFound()
  }
  
  return <ClinicLayout data={data} />
}
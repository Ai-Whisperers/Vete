// Server component wrapper for Prescriptions page
import PrescriptionsClient from '@/app/[clinic]/prescriptions/client'

export const generateMetadata = async () => ({
  title: 'Recetas Médicas - Sistema Veterinario',
  description: 'Gestión de recetas y prescripciones médicas veterinarias.',
  openGraph: { title: 'Recetas Médicas', description: 'Sistema de prescripciones veterinarias' },
  twitter: { card: 'summary_large_image' },
})

export default function PrescriptionsPage() {
  return <PrescriptionsClient />
}

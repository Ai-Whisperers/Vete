// Server component wrapper for Vaccine Reactions page
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import for code splitting
const VaccineReactionsClient = dynamic(() => import('./client'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
})

export const generateMetadata = async () => ({
  title: 'Reacciones Adversas a Vacunas - Herramienta Clínica',
  description:
    'Registro y monitoreo de reacciones adversas post-vacunación en pacientes veterinarios.',
  openGraph: {
    title: 'Reacciones a Vacunas',
    description: 'Sistema de farmacovigilancia veterinaria',
  },
  twitter: { card: 'summary_large_image' },
})

export default function VaccineReactionsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <VaccineReactionsClient />
    </Suspense>
  )
}

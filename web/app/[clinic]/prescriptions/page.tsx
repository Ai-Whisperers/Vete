// Server component wrapper for Prescriptions page

// Dynamic import for code splitting
import PrescriptionsClient from './client'

export const generateMetadata = async () => ({
  title: 'Recetas Médicas - Sistema Veterinario',
  description: 'Gestión de recetas y prescripciones médicas veterinarias.',
  openGraph: { title: 'Recetas Médicas', description: 'Sistema de prescripciones veterinarias' },
  twitter: { card: 'summary_large_image' },
})

export default function PrescriptionsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <PrescriptionsClient />
    
  )
}

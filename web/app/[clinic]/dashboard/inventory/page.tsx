import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import InventoryClient from '../../portal/inventory/client'
import { getClinicData } from '@/lib/clinics'

interface Props {
  params: Promise<{ clinic: string }>
}

export default async function DashboardInventoryPage({ params }: Props) {
  const { clinic } = await params

  // SEC-010: Require staff authentication with tenant verification
  await requireStaff(clinic)

  // Get clinic config for Google Sheet URL
  const clinicData = await getClinicData(clinic)
  const googleSheetUrl = clinicData?.config?.settings?.inventory_template_google_sheet_url || null

  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        </div>
      }>
        <InventoryClient googleSheetUrl={googleSheetUrl} />
      </Suspense>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import InventoryClient from '../../portal/inventory/client'
import { getClinicData } from '@/lib/clinics'

interface Props {
  params: Promise<{ clinic: string }>
}

export default async function DashboardInventoryPage({ params }: Props) {
  const { clinic } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login`)
  }

  // Staff check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile || !['vet', 'admin'].includes(profile.role) || profile.tenant_id !== clinic) {
    redirect(`/${clinic}/portal/dashboard`)
  }

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

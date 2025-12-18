import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HospitalDashboard } from '@/components/hospital/hospital-dashboard'

interface Props {
  params: Promise<{ clinic: string }>
}

export default async function HospitalPage({ params }: Props) {
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

  // Fetch initial data server-side
  const { data: hospitalizations } = await supabase
    .from('hospitalizations')
    .select(`
      id,
      hospitalization_number,
      hospitalization_type,
      acuity_level,
      admission_date,
      status,
      pets!inner (
        name,
        species
      ),
      kennels (
        kennel_number,
        location
      )
    `)
    .eq('tenant_id', clinic)
    .eq('status', 'admitted')
    .order('admission_date', { ascending: false })

  // Fetch kennel stats
  const { data: kennels } = await supabase
    .from('kennels')
    .select('id, kennel_status')
    .eq('tenant_id', clinic)

  const availableKennels = kennels?.filter(k => k.kennel_status === 'available').length || 0

  // Transform data
  const transformedHospitalizations = (hospitalizations || []).map((h: any) => ({
    id: h.id,
    hospitalization_number: h.hospitalization_number,
    hospitalization_type: h.hospitalization_type,
    acuity_level: h.acuity_level,
    admission_date: h.admission_date,
    pet: Array.isArray(h.pets) ? h.pets[0] : h.pets,
    kennel: Array.isArray(h.kennels) ? h.kennels[0] : h.kennels,
  }))

  // Calculate stats
  const stats = {
    total_active: transformedHospitalizations.length,
    by_acuity: {
      critical: transformedHospitalizations.filter((h: any) => h.acuity_level === 'critical').length,
      urgent: transformedHospitalizations.filter((h: any) => h.acuity_level === 'urgent').length,
      routine: transformedHospitalizations.filter((h: any) => h.acuity_level === 'routine').length,
    },
    available_kennels: availableKennels,
  }

  return (
    <HospitalDashboard
      clinic={clinic}
      initialHospitalizations={transformedHospitalizations}
      initialStats={stats}
    />
  )
}

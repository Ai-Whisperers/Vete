import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star, ArrowLeft, ChevronRight } from 'lucide-react'
import { LoyaltyClient } from './client'

interface LoyaltyPageProps {
  params: Promise<{ clinic: string }>
}

export default async function LoyaltyPage({ params }: LoyaltyPageProps) {
  const supabase = await createClient()
  const { clinic } = await params

  // Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${clinic}/portal/login?returnTo=/${clinic}/portal/loyalty`)
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect(`/${clinic}/portal/login`)
  }

  // Fetch loyalty points
  const { data: loyalty } = await supabase
    .from('loyalty_points')
    .select('balance, tier, lifetime_earned, lifetime_redeemed')
    .eq('client_id', user.id)
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle()

  const loyaltyData = {
    points: loyalty?.balance || 0,
    tier: loyalty?.tier || 'bronze',
    lifetime_earned: loyalty?.lifetime_earned || 0,
    lifetime_redeemed: loyalty?.lifetime_redeemed || 0,
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${clinic}/portal`}
          className="mb-4 inline-flex items-center gap-2 text-[var(--text-secondary)] transition hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Portal
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Star className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mis Puntos</h1>
              <p className="text-[var(--text-muted)]">Programa de Lealtad</p>
            </div>
          </div>

          <Link
            href={`/${clinic}/store`}
            className="hidden items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 font-medium text-white transition hover:brightness-110 md:flex"
          >
            Ir a la Tienda
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Client Component */}
      <LoyaltyClient clinic={clinic} initialData={loyaltyData} />
    </div>
  )
}

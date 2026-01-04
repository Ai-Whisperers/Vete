import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignupForm } from '@/components/auth/signup-form'

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinic: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { clinic } = await params
  const sp = await searchParams
  const redirectTo =
    (sp.redirect as string) ?? (sp.returnTo as string) ?? `/${clinic}/portal/dashboard`

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(redirectTo)
  }

  return <SignupForm clinic={clinic} redirectTo={redirectTo} />
}

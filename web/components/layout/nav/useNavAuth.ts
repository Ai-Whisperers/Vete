'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  tenant_id: string
  role: 'owner' | 'vet' | 'admin'
  full_name: string | null
  email: string | null
  phone: string | null
}

interface UseNavAuthReturn {
  user: SupabaseUser | null
  profile: UserProfile | null
  isLoading: boolean
  isLoggingOut: boolean
  logoutError: string | null
  handleLogout: () => Promise<void>
}

export function useNavAuth(clinic: string): UseNavAuthReturn {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start as loading to prevent flash
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    setLogoutError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
      setProfile(null)
      router.push(`/${clinic}/portal/login`)
      router.refresh()
    } catch {
      setLogoutError('Error al cerrar sesión. Intente de nuevo.')
      setTimeout(() => setLogoutError(null), 5000)
    } finally {
      setIsLoggingOut(false)
    }
  }, [supabase, clinic, router])

  useEffect(() => {
    const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('id, tenant_id, role, full_name, email, phone')
          .eq('id', userId)
          .maybeSingle() // Use maybeSingle to avoid 406 when profile doesn't exist

        if (error) {
          console.warn('Profile fetch error:', error.message)
          return null
        }
        return prof as UserProfile | null
      } catch {
        return null
      }
    }

    const checkUser = async () => {
      try {
        // Use getUser() instead of getSession() for reliable server-verified auth
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser()

        if (error || !authUser) {
          setUser(null)
          setProfile(null)
          return
        }

        setUser(authUser)
        const prof = await fetchProfile(authUser.id)
        setProfile(prof)
      } catch {
        setUser(null)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // On auth state change, re-verify with server
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // Verify the user with the server to ensure token is valid
          const { data: { user: verifiedUser } } = await supabase.auth.getUser()
          if (verifiedUser) {
            setUser(verifiedUser)
            const prof = await fetchProfile(verifiedUser.id)
            setProfile(prof)
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return {
    user,
    profile,
    isLoading,
    isLoggingOut,
    logoutError,
    handleLogout,
  }
}

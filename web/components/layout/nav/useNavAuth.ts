"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  tenant_id: string;
  role: 'owner' | 'vet' | 'admin';
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface UseNavAuthReturn {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  isLoggingOut: boolean;
  logoutError: string | null;
  handleLogout: () => Promise<void>;
}

export function useNavAuth(clinic: string): UseNavAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      router.push(`/${clinic}/portal/login`);
      router.refresh();
    } catch {
      setLogoutError("Error al cerrar sesión. Intente de nuevo.");
      setTimeout(() => setLogoutError(null), 5000);
    } finally {
      setIsLoggingOut(false);
    }
  }, [supabase, clinic, router]);

  useEffect(() => {
    const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('id, tenant_id, role, full_name, email, phone')
          .eq('id', userId)
          .maybeSingle(); // Use maybeSingle to avoid 406 when profile doesn't exist

        if (error) {
          console.warn('Profile fetch error:', error.message);
          return null;
        }
        return prof as UserProfile | null;
      } catch {
        return null;
      }
    };

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch {
        // Error checking user - silently fail
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return {
    user,
    profile,
    isLoggingOut,
    logoutError,
    handleLogout,
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    clinic: formData.get("clinic") as string,
  };

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/${data.clinic}/portal`, "layout");
  redirect(`/${data.clinic}/portal/dashboard`);
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    fullName: formData.get("fullName") as string,
    clinic: formData.get("clinic") as string,
  };

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is disabled, we can redirect.
  // Ideally show "check email" message.
  return { success: true, message: "¡Cuenta creada! Revisa tu email para confirmar." };
}

export async function loginWithGoogle(clinic: string) {
  const supabase = await createClient();
  
  // We need the origin to redirect back correctly
  // In server actions headers() can provide host but it's easier to handle redirect URL on client if possible, 
  // currently createClient (server) needs a URL to redirect to.
  // For OAuth, it's often easier to initiate client-side or provide a hardcoded production URL.
  // Here we use a relative path which Supabase handles if configured, or the site URL.
  
  const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/${clinic}/portal/dashboard`
     }
  });

  if (data.url) {
    redirect(data.url);
  }
  
  if (error) {
      console.error(error);
      // In a server action we can't easily alert, so we might return error state if not redirecting
      throw new Error(error.message);
  }
}

export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const clinic = formData.get('clinic') as string;

  if (!email) {
    return { error: 'El correo electrónico es requerido' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${clinic}/portal/reset-password`
  });

  if (error) {
    // Log error but don't reveal if email exists (security best practice)
    console.error('Password reset error:', error);
  }

  // Always return success to prevent email enumeration attacks
  return { success: true };
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('Update password error:', error);
    return { error: 'Error al actualizar la contraseña. El enlace puede haber expirado.' };
  }

  return { success: true };
}

export async function logout(clinic: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    throw new Error('Error al cerrar sesión');
  }

  revalidatePath(`/${clinic}/portal`, 'layout');
  redirect(`/${clinic}/portal/login`);
}

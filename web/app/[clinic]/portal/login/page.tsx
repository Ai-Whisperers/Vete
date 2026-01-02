import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinic: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { clinic } = await params;
  const sp = await searchParams;
  // Default redirect to /portal which routes based on user role
  const redirectTo = (sp.redirect as string) ?? (sp.returnTo as string) ?? `/${clinic}/portal`;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect(redirectTo);
  }

  return <LoginForm clinic={clinic} redirectTo={redirectTo} />;
}
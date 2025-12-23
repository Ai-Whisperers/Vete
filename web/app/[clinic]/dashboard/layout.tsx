import { getClinicData } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clinic: string }>;
}): Promise<React.ReactElement> {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) {
    notFound();
  }

  // Check authentication and authorization
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  // Check if user is staff (vet or admin)
  let { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  // Handle case where profile doesn't exist (trigger may have failed)
  if (!profile) {
    // Create profile for authenticated user - defaults to owner role
    // Check if this is a demo account and set appropriate role/tenant
    let role = "owner";
    let tenantId = clinic;

    // Check demo accounts
    try {
      const { data: demoAccount } = await supabase
        .from("demo_accounts")
        .select("role, tenant_id")
        .eq("email", user.email)
        .eq("is_active", true)
        .single();

      if (demoAccount) {
        role = demoAccount.role;
        tenantId = demoAccount.tenant_id;
      }
    } catch (error) {
      // demo_accounts table might not exist or other error, continue with defaults
    }

    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Usuario",
        avatar_url: user.user_metadata?.avatar_url,
        tenant_id: tenantId,
        role: role,
      })
      .select("role, tenant_id")
      .single();

    if (createError || !newProfile) {
      // If we still can't create profile, redirect to login
      await supabase.auth.signOut();
      redirect(`/${clinic}/portal/login?error=profile_creation_failed`);
    }
    profile = newProfile;
  }

  // Handle case where user has no tenant assigned
  if (!profile.tenant_id) {
    await supabase
      .from("profiles")
      .update({ tenant_id: clinic })
      .eq("id", user.id);
    profile.tenant_id = clinic;
  }

  const isStaff = profile.role === "vet" || profile.role === "admin";

  // Non-staff users should use the portal
  if (!isStaff) {
    redirect(`/${clinic}/portal/dashboard`);
  }

  // Staff must belong to this clinic
  if (profile.tenant_id !== clinic) {
    redirect(`/${profile.tenant_id}/dashboard`);
  }

  return (
    <DashboardShell clinic={clinic} clinicName={data.config.name}>
      {children}
    </DashboardShell>
  );
}

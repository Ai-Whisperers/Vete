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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  // Check if user is staff (vet or admin)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  const isStaff = profile?.role === 'vet' || profile?.role === 'admin';

  if (!isStaff) {
    // Redirect non-staff users to portal
    redirect(`/${clinic}/portal/dashboard`);
  }

  return (
    <DashboardShell clinic={clinic} clinicName={data.config.name}>
      {children}
    </DashboardShell>
  );
}

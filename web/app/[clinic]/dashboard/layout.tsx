import { getClinicData } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

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
    <div className="flex min-h-screen bg-[var(--bg-subtle)]">
      {/* Sidebar */}
      <DashboardSidebar clinic={clinic} clinicName={data.config.name} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

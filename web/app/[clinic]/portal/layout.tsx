import Link from "next/link";
import * as Icons from "lucide-react";
import { getClinicData } from "@/lib/clinics";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";
import { PortalMobileNav } from "@/components/portal/portal-mobile-nav";
import { redirect } from "next/navigation";

// Helper to get icon component by name for server-side rendering
function getIcon(name: string): React.ComponentType<{ className?: string }> {
  const icon = (Icons as Record<string, unknown>)[name];
  if (typeof icon === 'function') {
    return icon as React.ComponentType<{ className?: string }>;
  }
  return Icons.Circle;
}

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clinic: string }>;
}) {
  const { clinic } = await params;
  const data = await getClinicData(clinic);

  if (!data) return null;

  // Get user and validate tenant access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Require authentication for portal
  if (!user) {
    redirect(`/${clinic}/portal/login?redirect=${encodeURIComponent(`/${clinic}/portal/dashboard`)}`);
  }

  // Get profile with tenant_id for validation
  let { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  // Handle case where profile doesn't exist (trigger may have failed)
  if (!profile) {
    // Create profile for authenticated user with current clinic
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        avatar_url: user.user_metadata?.avatar_url,
        tenant_id: clinic,
        role: 'owner'
      })
      .select('role, tenant_id')
      .single();

    if (createError || !newProfile) {
      // If we still can't create profile, sign out and redirect
      await supabase.auth.signOut();
      redirect(`/${clinic}/portal/login?error=profile_creation_failed`);
    }
    profile = newProfile;
  }

  // Handle case where user has no tenant assigned (signed up without invite)
  if (!profile.tenant_id) {
    // Assign user to current clinic
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tenant_id: clinic })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to assign tenant:', updateError);
      await supabase.auth.signOut();
      redirect(`/${clinic}/portal/login?error=tenant_assignment_failed`);
    }
    profile.tenant_id = clinic;
  }

  // Validate tenant access - users can only access their own clinic's portal
  if (profile.tenant_id !== clinic) {
    // Redirect to user's actual clinic if they try to access another clinic's portal
    redirect(`/${profile.tenant_id}/portal/dashboard`);
  }

  const userRole: 'owner' | 'vet' | 'admin' = profile.role || 'owner';
  const isStaff = userRole === 'vet' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  // Main navigation items (visible to all) - use iconName for Client Component serialization
  const mainNavItems = [
    { iconName: 'LayoutDashboard', label: data.config.ui_labels?.nav?.dashboard || 'Dashboard', href: `/${clinic}/portal/dashboard` },
    { iconName: 'Calendar', label: 'Mis Citas', href: `/${clinic}/portal/appointments` },
    { iconName: 'MessageCircle', label: 'Mensajes', href: `/${clinic}/portal/messages` },
  ];

  // Finance items (visible to all)
  const financeItems = [
    { iconName: 'CreditCard', label: 'Pagos', href: `/${clinic}/portal/payments` },
  ];

  // Staff-only items
  const staffItems = isStaff ? [
    { iconName: 'Stethoscope', label: 'Dashboard Clínico', href: `/${clinic}/dashboard` },
    { iconName: 'Package', label: 'Inventario', href: `/${clinic}/portal/inventory` },
    { iconName: 'FileBox', label: 'Productos', href: `/${clinic}/portal/products` },
  ] : [];

  // Admin-only items - point to dashboard for admin features
  const adminItems = isAdmin ? [
    { iconName: 'Users', label: 'Equipo', href: `/${clinic}/dashboard/team` },
    { iconName: 'ClipboardList', label: 'Auditoria', href: `/${clinic}/dashboard/audit` },
    { iconName: 'Activity', label: 'Epidemiologia', href: `/${clinic}/portal/epidemiology` },
  ] : [];

  // Settings items
  const settingsItems = [
    { iconName: 'UserCircle', label: data.config.ui_labels?.nav?.profile || 'Perfil', href: `/${clinic}/portal/profile` },
    { iconName: 'Bell', label: 'Notificaciones', href: `/${clinic}/portal/settings/notifications` },
    { iconName: 'Shield', label: 'Seguridad', href: `/${clinic}/portal/settings/security` },
  ];

  // Combine all items for desktop nav (simplified view) - keep icon components for server rendering
  const desktopNavItems = [
    { icon: Icons.LayoutDashboard, label: data.config.ui_labels?.nav?.dashboard || 'Dashboard', href: `/${clinic}/portal/dashboard` },
    { icon: Icons.Calendar, label: 'Mis Citas', href: `/${clinic}/portal/appointments` },
    { icon: Icons.MessageCircle, label: 'Mensajes', href: `/${clinic}/portal/messages` },
    { icon: Icons.CreditCard, label: 'Pagos', href: `/${clinic}/portal/payments` },
    ...(isStaff ? [{ icon: Icons.Stethoscope, label: 'Clínico', href: `/${clinic}/dashboard` }] : []),
    { icon: Icons.UserCircle, label: data.config.ui_labels?.nav?.profile || 'Perfil', href: `/${clinic}/portal/profile` },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] flex flex-col">
       {/* Portal-Specific Header */}
       <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
           <div className="container mx-auto px-4 h-16 flex items-center justify-between">
               <div className="flex items-center gap-4 md:gap-8">
                   <Link href={`/${data.config.id}`} className="flex items-center gap-2 font-bold text-[var(--primary)] hover:opacity-80 transition-opacity">
                       <Icons.ArrowLeft className="w-5 h-5" />
                       <span className="hidden md:inline">{data.config.ui_labels?.nav?.back || 'Volver'}</span>
                   </Link>

                   {/* Desktop Navigation */}
                   <nav className="hidden lg:flex items-center gap-1">
                       {desktopNavItems.map((item) => (
                           <Link
                               key={item.href}
                               href={item.href}
                               className="px-3 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all flex items-center gap-2"
                           >
                               <item.icon className="w-4 h-4" />
                               {item.label}
                           </Link>
                       ))}
                   </nav>
               </div>

               <div className="flex items-center gap-2 md:gap-4">
                   {/* Notifications */}
                   <Link
                       href={`/${clinic}/portal/notifications`}
                       className="p-2 rounded-lg text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all"
                       title="Notificaciones"
                   >
                       <Icons.Bell className="w-5 h-5" />
                   </Link>

                   {/* Mobile Menu */}
                   <PortalMobileNav
                       clinic={clinic}
                       mainNavItems={mainNavItems}
                       financeItems={financeItems}
                       staffItems={staffItems}
                       adminItems={adminItems}
                       settingsItems={settingsItems}
                   />

                   <LogoutButton clinic={clinic} />
               </div>
           </div>
       </header>

       <main className="flex-1 container mx-auto px-4 py-8">
           {children}
       </main>
    </div>
  );
}

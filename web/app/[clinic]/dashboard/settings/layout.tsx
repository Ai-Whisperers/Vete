import { getClinicData } from "@/lib/clinics";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Building2,
  Palette,
  ToggleRight,
  DollarSign,
  ArrowLeft
} from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ clinic: string }>;
}

const settingsNav = [
  {
    href: "general",
    label: "General",
    icon: Building2,
    description: "Nombre, contacto, horarios"
  },
  {
    href: "branding",
    label: "Marca",
    icon: Palette,
    description: "Logo, colores, tema"
  },
  {
    href: "modules",
    label: "Módulos",
    icon: ToggleRight,
    description: "Activar/desactivar funciones"
  },
  {
    href: "services",
    label: "Servicios y Precios",
    icon: DollarSign,
    description: "Catálogo de servicios"
  },
];

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps): Promise<React.ReactElement> {
  const { clinic } = await params;
  const clinicData = await getClinicData(clinic);

  if (!clinicData) {
    notFound();
  }

  // Check admin role
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${clinic}/portal/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, tenant_id")
    .eq("id", user.id)
    .single();

  // Only admins can access settings
  if (!profile || profile.role !== "admin") {
    redirect(`/${clinic}/dashboard`);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${clinic}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--primary)] bg-opacity-10 rounded-lg">
            <Settings className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Configuración
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Administra la configuración de {clinicData.config.name}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Navigation + Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar */}
        <nav className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={`/${clinic}/dashboard/settings/${item.href}`}
                  className="flex items-start gap-3 p-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[var(--primary)] group-hover:bg-opacity-10 transition-colors">
                    <Icon className="w-4 h-4 text-gray-500 group-hover:text-[var(--primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 group-hover:text-[var(--primary)]">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

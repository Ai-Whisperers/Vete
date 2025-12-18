import Link from "next/link";
import * as Icons from "lucide-react";
import { getClinicData } from "@/lib/clinics";
import { LogoutButton } from "@/components/auth/logout-button";

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

  const navItems = [
    { icon: Icons.LayoutDashboard, label: data.config.ui_labels?.nav?.dashboard, href: `/${clinic}/portal/dashboard` },
    { icon: Icons.UserCircle, label: data.config.ui_labels?.nav?.profile, href: `/${clinic}/portal/profile` },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-subtle)] flex flex-col">
       {/* Portal-Specific Header */}
       <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
           <div className="container mx-auto px-4 h-16 flex items-center justify-between">
               <div className="flex items-center gap-8">
                   <Link href={`/${data.config.id}`} className="flex items-center gap-2 font-bold text-[var(--primary)] hover:opacity-80 transition-opacity">
                       <Icons.ArrowLeft className="w-5 h-5" />
                       <span className="hidden md:inline">{data.config.ui_labels?.nav?.back}</span>
                   </Link>
                   
                   {/* Main Navigation */}
                   <nav className="hidden md:flex items-center gap-1">
                       {navItems.map((item) => (
                           <Link 
                               key={item.href} 
                               href={item.href}
                               className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all flex items-center gap-2"
                           >
                               <item.icon className="w-4 h-4" />
                               {item.label}
                           </Link>
                       ))}
                   </nav>
               </div>

               <div className="flex items-center gap-4">
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

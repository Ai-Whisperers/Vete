"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClinicConfig } from "@/lib/clinics";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, LogOut, Home, Briefcase, Users, Store, User, Calendar, Settings, Phone, PawPrint } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/cart-context";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  tenant_id: string;
  role: 'owner' | 'vet' | 'admin';
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface MainNavProps {
  clinic: string;
  config: ClinicConfig;
}

export function MainNav({ clinic, config }: Readonly<MainNavProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const { itemCount } = useCart();

  // Memoize supabase client to prevent recreation on each render
  const supabase = useMemo(() => createClient(), []);

  // Ref for focus trap in mobile menu
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutError("Error al cerrar sesión. Intente de nuevo.");
      // Auto-clear error after 5 seconds
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
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return null;
        }
        return prof as UserProfile;
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        return null;
      }
    };

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
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
      } catch (err) {
        console.error("Unexpected error checking user:", err);
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = [
    {
      label: config.ui_labels?.nav.home || "Inicio",
      href: `/${clinic}`,
      exact: true,
      icon: Home,
    },
    {
      label: config.ui_labels?.nav.services || "Servicios",
      href: `/${clinic}/services`,
      icon: Briefcase,
    },
    {
      label: config.ui_labels?.nav.about || "Nosotros",
      href: `/${clinic}/about`,
      icon: Users,
    },
    {
      label: config.ui_labels?.nav.store || "Tienda",
      href: `/${clinic}/store`,
      icon: Store,
    },
    ...(profile?.role === 'admin' || profile?.role === 'vet' ? [{
        label: "Inventario",
        href: `/${clinic}/portal/inventory`,
        icon: Briefcase,
    }] : []),
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-base font-bold uppercase tracking-wide transition-colors relative group ${
              isActive(item.href, item.exact)
                ? "text-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
            }`}
          >
            {item.label}
            <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ${
                isActive(item.href, item.exact) ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
          </Link>
        ))}

        {/* Dynamic Auth Links */}
        <Link
            href={user ? `/${clinic}/portal/dashboard` : `/${clinic}/portal/login`}
            className={`text-base font-bold uppercase tracking-wide transition-colors relative group ${
                isActive(`/${clinic}/portal`)
                ? "text-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
            }`}
        >
            {user ? (config.ui_labels?.nav.owners_zone || "Zona de Dueños") : (config.ui_labels?.nav.login_profile || "LogIn / Mi Perfil")}
             <span
              className={`absolute -bottom-1 left-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ${
                isActive(`/${clinic}/portal`) ? "w-full" : "w-0 group-hover:w-full"
              }`}
            ></span>
        </Link>
        
        {/* Notification Bell - Only for logged in users */}
        {user && <NotificationBell clinic={clinic} />}

        {/* Cart Icon - Always visible for all users */}
        <Link
            href={`/${clinic}/cart`}
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            aria-label={itemCount > 0 ? `Carrito de compras (${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'})` : 'Carrito de compras'}
        >
            <ShoppingCart className="w-6 h-6" aria-hidden="true" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--status-error,#dc2626)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full" aria-hidden="true">
                    {itemCount}
                </span>
            )}
        </Link>

        {/* Logout Button */}
        {user && (
            <div className="relative">
              <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--status-error,#dc2626)] hover:bg-[var(--status-error-bg,#fef2f2)] rounded-lg transition-colors disabled:opacity-50"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
              >
                  <LogOut className="w-5 h-5" />
              </button>
              {/* Error toast for logout */}
              {logoutError && (
                <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-[var(--status-error,#ef4444)] text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap z-50" role="alert">
                  {logoutError}
                </div>
              )}
            </div>
        )}

      </nav>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden items-center gap-4">
          {user && <NotificationBell clinic={clinic} />}

          {/* Mobile cart - Always visible */}
          <Link
              href={`/${clinic}/cart`}
              className="relative p-2 text-[var(--primary)]"
              aria-label={itemCount > 0 ? `Carrito de compras (${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'})` : 'Carrito de compras'}
          >
              <ShoppingCart className="w-6 h-6" aria-hidden="true" />
              {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--status-error,#dc2626)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full" aria-hidden="true">
                      {itemCount}
                  </span>
              )}
          </Link>

          <button
            className="p-2 text-[var(--primary)] z-50 relative"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[var(--bg-default)] shadow-2xl z-40 md:hidden border-l border-[var(--primary)]/10 flex flex-col pt-20 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
            >
               {/* User Profile Section */}
               {user && profile && (
                 <div className="px-6 py-4 bg-[var(--primary)]/5 border-b border-[var(--primary)]/10">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">
                       {profile.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-[var(--text-primary)] truncate">
                         {profile.full_name || 'Usuario'}
                       </p>
                       <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                     </div>
                   </div>
                 </div>
               )}

               {/* CTA Button - Book Appointment */}
               <div className="px-6 py-4">
                 <Link
                   href={`/${clinic}/book`}
                   className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                 >
                   <Calendar className="w-5 h-5" />
                   {config.ui_labels?.nav.book_btn || 'Agendar Cita'}
                 </Link>
               </div>

               {/* Navigation Links */}
               <div className="flex-1 px-6">
                 <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Navegación</p>
                 <div className="flex flex-col gap-1">
                   {navItems.map((item) => {
                     const Icon = item.icon;
                     return (
                       <Link
                         key={item.href}
                         href={item.href}
                         className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-colors ${
                           isActive(item.href, item.exact)
                             ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                             : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                         }`}
                       >
                         <Icon className="w-5 h-5" />
                         <span className="font-bold">{item.label}</span>
                       </Link>
                     );
                   })}
                 </div>

                 {/* Portal Section */}
                 <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mt-6 mb-3">Mi Cuenta</p>
                 <div className="flex flex-col gap-1">
                   <Link
                     href={user ? `/${clinic}/portal/dashboard` : `/${clinic}/portal/login`}
                     className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-colors ${
                       isActive(`/${clinic}/portal/dashboard`)
                         ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                         : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                     }`}
                   >
                     <PawPrint className="w-5 h-5" />
                     <span className="font-bold">
                       {user ? (config.ui_labels?.nav.my_pets || 'Mis Mascotas') : (config.ui_labels?.nav.login_profile || 'Iniciar Sesión')}
                     </span>
                   </Link>

                   {user && (
                     <>
                       <Link
                         href={`/${clinic}/portal/profile`}
                         className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-colors ${
                           isActive(`/${clinic}/portal/profile`)
                             ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                             : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                         }`}
                       >
                         <User className="w-5 h-5" />
                         <span className="font-bold">{config.ui_labels?.nav.profile || 'Mi Perfil'}</span>
                       </Link>
                       <Link
                         href={`/${clinic}/portal/settings`}
                         className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-colors ${
                           isActive(`/${clinic}/portal/settings`)
                             ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                             : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                         }`}
                       >
                         <Settings className="w-5 h-5" />
                         <span className="font-bold">Configuración</span>
                       </Link>
                     </>
                   )}
                 </div>

                 {/* Logout Button */}
                 {user && (
                   <button
                     onClick={handleLogout}
                     disabled={isLoggingOut}
                     className="flex items-center gap-4 py-3 px-4 rounded-xl transition-colors text-[var(--status-error,#ef4444)] hover:bg-[var(--status-error-bg,#fef2f2)] w-full text-left mt-2 disabled:opacity-50"
                   >
                     <LogOut className="w-5 h-5" />
                     <span className="font-bold">Cerrar sesión</span>
                   </button>
                 )}
               </div>

               {/* Emergency & Footer */}
               <div className="mt-auto px-6 py-6 bg-[var(--bg-subtle)] border-t border-[var(--border,#e5e7eb)]">
                 {config.settings?.emergency_24h && (
                   <a
                     href={`tel:${config.contact?.whatsapp_number}`}
                     className="flex items-center justify-center gap-2 w-full py-3 mb-4 bg-[var(--status-error,#ef4444)] text-white font-bold rounded-xl"
                   >
                     <Phone className="w-4 h-4" />
                     {config.ui_labels?.nav.emergency_btn || 'Urgencias 24hs'}
                   </a>
                 )}
                 <p className="text-center text-xs text-[var(--text-muted)]">
                   © {new Date().getFullYear()} {config.name}
                 </p>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

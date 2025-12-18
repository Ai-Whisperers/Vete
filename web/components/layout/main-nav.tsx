"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClinicConfig } from "@/lib/clinics";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, LogOut } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/cart-context";

interface MainNavProps {
  clinic: string;
  config: ClinicConfig;
}

export function MainNav({ clinic, config }: Readonly<MainNavProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { itemCount } = useCart();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push(`/${clinic}/portal/login`);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    },
    {
      label: config.ui_labels?.nav.services || "Servicios",
      href: `/${clinic}/services`,
    },
    {
      label: config.ui_labels?.nav.about || "Nosotros",
      href: `/${clinic}/about`,
    },
    {
      label: config.ui_labels?.nav.store || "Tienda",
      href: `/${clinic}/store`,
    },
    ...(profile?.role === 'admin' || profile?.role === 'vet' ? [{
        label: "Inventario",
        href: `/${clinic}/portal/inventory`,
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
        
        {/* Notification Bell */}
        {user && <NotificationBell clinic={clinic} />}

        {/* Cart Icon */}
        {user && (
            <Link
                href={`/${clinic}/cart`}
                className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
            >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {itemCount}
                    </span>
                )}
            </Link>
        )}

        {/* Logout Button */}
        {user && (
            <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Cerrar sesión"
            >
                <LogOut className="w-5 h-5" />
            </button>
        )}

      </nav>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden items-center gap-4">
          {user && <NotificationBell clinic={clinic} />}

          {user && (
            <Link
                href={`/${clinic}/cart`}
                className="relative p-2 text-[var(--primary)]"
            >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {itemCount}
                    </span>
                )}
            </Link>
          )}

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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[var(--bg-default)] shadow-2xl z-40 md:hidden border-l border-[var(--primary)]/10 flex flex-col pt-24 px-8"
            >
               <div className="flex flex-col gap-6">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`text-xl font-bold uppercase tracking-widest py-4 border-b border-gray-100 ${
                        isActive(item.href, item.exact)
                            ? "text-[var(--primary)] border-[var(--primary)]"
                            : "text-[var(--text-secondary)]"
                        }`}
                    >
                        {item.label}
                    </Link>
                ))}
                
                 <Link
                    href={user ? `/${clinic}/portal/dashboard` : `/${clinic}/portal/login`}
                    className={`text-xl font-bold uppercase tracking-widest py-4 border-b border-gray-100 ${
                    isActive(`/${clinic}/portal`)
                        ? "text-[var(--primary)] border-[var(--primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                >
                    {user ? (config.ui_labels?.nav.owners_zone || "Zona de Dueños") : (config.ui_labels?.nav.login_profile || "LogIn / Mi Perfil")}
                </Link>

                {/* Logout in mobile menu */}
                {user && (
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="text-xl font-bold uppercase tracking-widest py-4 border-b border-gray-100 text-red-500 hover:text-red-600 transition-colors flex items-center gap-3 disabled:opacity-50 w-full text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar sesión
                    </button>
                )}

               </div>
               
               <div className="mt-auto mb-12">
                   <p className="text-center text-sm text-[var(--text-muted)]">
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

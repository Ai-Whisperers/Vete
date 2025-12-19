"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClinicConfig } from "@/lib/clinics";
import { ShoppingCart, Home, Briefcase, Users, Store } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { useCart } from "@/context/cart-context";
import { useNavAuth } from "./nav/useNavAuth";
import { ToolsDropdown } from "./nav/ToolsDropdown";
import { UserMenu } from "./nav/UserMenu";
import { MobileMenu, type NavItem } from "./nav/MobileMenu";

interface MainNavProps {
  clinic: string;
  config: ClinicConfig;
}

export function MainNav({ clinic, config }: Readonly<MainNavProps>) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user, profile, isLoggingOut, logoutError, handleLogout } = useNavAuth(clinic);

  const navItems: NavItem[] = [
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

  const isActive = (href: string, exact: boolean = false): boolean => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
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

        <ToolsDropdown
          clinic={clinic}
          config={config}
          isActive={isActive}
          pathname={pathname}
        />

        <UserMenu
          clinic={clinic}
          config={config}
          user={user}
          isActive={isActive}
          isLoggingOut={isLoggingOut}
          logoutError={logoutError}
          handleLogout={handleLogout}
        />

        {user && <NotificationBell clinic={clinic} />}

        <Link
          href={`/${clinic}/cart`}
          className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
          aria-label={itemCount > 0 ? `Carrito de compras (${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'})` : 'Carrito de compras'}
        >
          <ShoppingCart className="w-6 h-6" aria-hidden="true" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-[var(--status-error,#dc2626)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full" aria-label={`${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'} en el carrito`}>
              {itemCount}
            </span>
          )}
        </Link>
      </nav>

      <div className="flex md:hidden items-center gap-3">
        {user && <NotificationBell clinic={clinic} />}

        <Link
          href={`/${clinic}/cart`}
          className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--primary)]"
          aria-label={itemCount > 0 ? `Carrito de compras (${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'})` : 'Carrito de compras'}
        >
          <ShoppingCart className="w-6 h-6" aria-hidden="true" />
          {itemCount > 0 && (
            <span className="absolute top-1 right-1 bg-[var(--status-error,#dc2626)] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full" aria-label={`${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'} en el carrito`}>
              {itemCount}
            </span>
          )}
        </Link>

        <MobileMenu
          clinic={clinic}
          config={config}
          user={user}
          profile={profile}
          navItems={navItems}
          isActive={isActive}
          isLoggingOut={isLoggingOut}
          handleLogout={handleLogout}
        />
      </div>
    </>
  );
}

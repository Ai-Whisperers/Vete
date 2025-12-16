"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClinicConfig } from "@/lib/clinics";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface MainNavProps {
  clinic: string;
  config: ClinicConfig;
}

export function MainNav({ clinic, config }: MainNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 text-[var(--primary)] z-50 relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

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

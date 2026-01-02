"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Wrench, Calculator, Apple, HelpCircle, Gift } from "lucide-react";
import type { ClinicConfig } from "@/lib/clinics";

interface ToolsDropdownProps {
  clinic: string;
  config: ClinicConfig;
  isActive: (href: string) => boolean;
  pathname: string;
}

interface ToolItem {
  label: string;
  href: string;
  icon: typeof Calculator;
}

export function ToolsDropdown({ clinic, config, isActive, pathname }: Readonly<ToolsDropdownProps>) {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const toolsItems: ToolItem[] = [
<<<<<<< HEAD
    { label: config.ui_labels?.tools?.age_calculator?.title || "Calculadora de Edad", href: `/${clinic}/tools/age-calculator`, icon: Calculator },
    { label: config.ui_labels?.tools?.toxic_food?.title || "Alimentos Tóxicos", href: `/${clinic}/tools/toxic-food`, icon: Apple },
=======
    { label: config.ui_labels?.tools?.age_calculator || "Calculadora de Edad", href: `/${clinic}/tools/age-calculator`, icon: Calculator },
    { label: config.ui_labels?.tools?.toxic_food || "Alimentos Tóxicos", href: `/${clinic}/tools/toxic-food`, icon: Apple },
>>>>>>> cc104e4 (feat: Introduce command palette, refactor calendar and pets-by-owner components, add new pages, server actions, and extensive database schema updates with security fixes and testing documentation.)
    { label: config.ui_labels?.nav?.faq || "Preguntas Frecuentes", href: `/${clinic}/faq`, icon: HelpCircle },
    { label: config.ui_labels?.nav?.loyalty_program || "Programa de Lealtad", href: `/${clinic}/loyalty_points`, icon: Gift },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsToolsOpen(false);
  }, [pathname]);

  const isToolsActive = isToolsOpen || pathname.includes('/tools') || pathname.includes('/faq') || pathname.includes('/loyalty');

  return (
    <div ref={toolsMenuRef} className="relative">
      <button
        onClick={() => setIsToolsOpen(!isToolsOpen)}
        aria-expanded={isToolsOpen}
        aria-haspopup="true"
        aria-label="Menú de herramientas"
        className={`text-base font-bold uppercase tracking-wide transition-colors relative group flex items-center gap-1 ${
          isToolsActive
            ? "text-[var(--primary)]"
            : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
        }`}
      >
        <Wrench className="w-4 h-4" aria-hidden="true" />
        {config.ui_labels?.nav?.tools || 'Herramientas'}
        <ChevronDown className={`w-4 h-4 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {isToolsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            role="menu"
            aria-label="Opciones de herramientas"
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
          >
            {toolsItems.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setIsToolsOpen(false)}
                  role="menuitem"
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(tool.href)
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[var(--primary)]"
                  }`}
                >
                  <ToolIcon className="w-4 h-4" aria-hidden="true" />
                  {tool.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

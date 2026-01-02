'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Syringe,
  FolderOpen,
  Calendar,
  CreditCard,
} from 'lucide-react';

export type TabId = 'summary' | 'history' | 'vaccines' | 'documents' | 'appointments' | 'finances';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'summary', label: 'Resumen', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'history', label: 'Historial', icon: <FileText className="w-4 h-4" /> },
  { id: 'vaccines', label: 'Vacunas', icon: <Syringe className="w-4 h-4" /> },
  { id: 'documents', label: 'Documentos', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'appointments', label: 'Citas', icon: <Calendar className="w-4 h-4" /> },
  { id: 'finances', label: 'Finanzas', icon: <CreditCard className="w-4 h-4" /> },
];

interface PetDetailTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export function PetDetailTabs({ activeTab, onTabChange }: PetDetailTabsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
      {/* Desktop tabs */}
      <div className="hidden md:flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile tabs - scrollable */}
      <div className="md:hidden flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Hook for managing tab state
export function usePetDetailTabs(initialTab: TabId = 'summary') {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  return { activeTab, setActiveTab };
}

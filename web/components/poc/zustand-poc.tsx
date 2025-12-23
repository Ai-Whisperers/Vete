'use client';

import { useUIStore } from '@/lib/store/ui-store';

export function ZustandPOC() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">
      <h3 className="text-lg font-bold mb-4">Zustand State Verification</h3>
      <div className="flex items-center gap-4">
        <p>
          Sidebar is: <span className="font-mono font-bold">{sidebarOpen ? 'OPEN' : 'CLOSED'}</span>
        </p>
        <button
          onClick={toggleSidebar}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Toggle State
        </button>
      </div>
    </div>
  );
}

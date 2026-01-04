'use client'

import { useUIStore } from '@/lib/store/ui-store'

export function ZustandPOC() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Zustand State Verification</h3>
      <div className="flex items-center gap-4">
        <p>
          Sidebar is: <span className="font-mono font-bold">{sidebarOpen ? 'OPEN' : 'CLOSED'}</span>
        </p>
        <button
          onClick={toggleSidebar}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Toggle State
        </button>
      </div>
    </div>
  )
}

import { Suspense } from 'react'
import FinanceDashboardClient from './client'
import { Loader2 } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        }
      >
        <FinanceDashboardClient />
      </Suspense>
    </div>
  )
}

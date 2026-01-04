import { Skeleton } from '@/components/ui/skeleton'

export default function PortalLoading() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}

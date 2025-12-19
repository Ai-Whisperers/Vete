import { Skeleton, SkeletonInvoiceRow, SkeletonButton } from '@/components/ui/skeleton'

export default function InvoicesLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-32" />
        <SkeletonButton size="lg" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-xs" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <SkeletonInvoiceRow key={i} />
        ))}
      </div>
    </div>
  )
}

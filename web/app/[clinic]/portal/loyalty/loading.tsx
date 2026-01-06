import { SkeletonStatCard, SkeletonList, Skeleton } from '@/components/ui/skeleton'

export default function LoyaltyLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Points card */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <Skeleton className="mb-4 h-6 w-32 bg-white/20" />
        <Skeleton className="mb-2 h-12 w-24 bg-white/20" />
        <Skeleton className="h-4 w-48 bg-white/20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* History */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <SkeletonList items={6} />
      </div>
    </div>
  )
}

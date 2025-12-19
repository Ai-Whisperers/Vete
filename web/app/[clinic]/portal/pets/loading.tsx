import { Skeleton, SkeletonPetCard } from '@/components/ui/skeleton'

export default function PetsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonPetCard key={i} />
        ))}
      </div>
    </div>
  )
}

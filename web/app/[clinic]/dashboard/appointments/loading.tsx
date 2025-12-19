import { Skeleton, SkeletonAppointmentCard, SkeletonButton } from '@/components/ui/skeleton'

export default function AppointmentsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <SkeletonButton size="md" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[...Array(8)].map((_, i) => (
          <SkeletonAppointmentCard key={i} />
        ))}
      </div>
    </div>
  )
}

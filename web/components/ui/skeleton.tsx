import { clsx } from "clsx";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rounded";
  animation?: "pulse" | "shimmer" | "none";
}

function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  ...props
}: SkeletonProps): React.ReactElement {
  const baseStyles = "bg-gray-200";

  const variants = {
    default: "rounded-md",
    circular: "rounded-full",
    rounded: "rounded-xl",
  };

  const animations = {
    pulse: "animate-pulse",
    shimmer:
      "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
    none: "",
  };

  return (
    <div
      className={clsx(baseStyles, variants[variant], animations[animation], className)}
      {...props}
    />
  );
}

// Pre-built skeleton components for common use cases
function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }): React.ReactElement {
  return (
    <div className={clsx("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }): React.ReactElement {
  return (
    <div className={clsx("bg-white rounded-2xl p-6 shadow-sm space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" variant="rounded" />
        <Skeleton className="h-8 w-20" variant="rounded" />
      </div>
    </div>
  );
}

function SkeletonProductCard({ className }: { className?: string }): React.ReactElement {
  return (
    <div className={clsx("bg-white rounded-2xl overflow-hidden shadow-sm", className)}>
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
      </div>
    </div>
  );
}

function SkeletonPetCard({ className }: { className?: string }): React.ReactElement {
  return (
    <div className={clsx("bg-white rounded-2xl p-6 shadow-sm", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }): React.ReactElement {
  return (
    <div className={clsx("bg-white rounded-2xl overflow-hidden shadow-sm", className)}>
      {/* Header */}
      <div className="grid gap-4 p-4 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-gray-50 last:border-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonProductCard,
  SkeletonPetCard,
  SkeletonTable,
};

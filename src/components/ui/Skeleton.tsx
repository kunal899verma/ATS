interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-white/6 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-2.5 w-full" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonResults() {
  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl border border-white/[0.06] p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <Skeleton className="h-40 w-40 rounded-full self-center lg:h-44 lg:w-44 lg:self-start" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

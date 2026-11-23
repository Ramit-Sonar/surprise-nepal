interface SkeletonProps {
  className?: string
  rounded?: string
}

function Skeleton({ className = "", rounded = "rounded-xl" }: SkeletonProps) {
  return <div className={`shimmer ${rounded} ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border">
      <Skeleton className="w-full h-56" rounded="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default Skeleton

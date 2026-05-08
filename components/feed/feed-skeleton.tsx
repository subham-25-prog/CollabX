import { Skeleton } from "@/components/ui/skeleton"

export function FeedSkeleton() {
  return (
    <div className="space-y-6 max-w-[540px] mx-auto w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-2xl p-4 space-y-4 border border-border/50 shadow-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-4">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  )
}

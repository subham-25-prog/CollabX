import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <div className="pt-16 pb-20 lg:pb-8 w-full">
      {/* Cover Image Skeleton */}
      <Skeleton className="h-32 sm:h-64 w-full" />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-20">
          <div className="flex items-end gap-4">
            <Skeleton className="w-24 h-24 sm:w-40 sm:h-40 rounded-full sm:rounded-2xl border-4 border-background" />
          </div>
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-3/4 max-w-xl" />

          <div className="flex gap-4 mt-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex gap-6 mt-8">
            <div className="space-y-2">
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

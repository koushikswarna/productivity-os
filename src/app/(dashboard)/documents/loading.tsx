import { Skeleton } from "@/components/ui/skeleton"

export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="w-56 h-96" />
        <div className="flex-1 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    </div>
  )
}

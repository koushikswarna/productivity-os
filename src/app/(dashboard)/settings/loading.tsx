import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-56 mt-2" />
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  )
}

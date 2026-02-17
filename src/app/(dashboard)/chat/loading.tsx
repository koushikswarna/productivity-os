import { Skeleton } from "@/components/ui/skeleton"

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Skeleton className="w-64 h-full" />
      <Skeleton className="flex-1 h-full" />
    </div>
  )
}

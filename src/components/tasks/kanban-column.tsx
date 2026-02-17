"use client"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  count: number
  children: React.ReactNode
}

export function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div ref={setNodeRef} className={cn("rounded-lg bg-muted/50 p-3 transition-colors", isOver && "bg-muted")}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{count}</span>
      </div>
      {children}
    </div>
  )
}

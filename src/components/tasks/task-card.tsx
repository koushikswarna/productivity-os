"use client"
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, MessageSquare, GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserAvatar } from "@/components/shared/user-avatar"
import { TaskDetailDialog } from "./task-detail-dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { TaskWithAssignee } from "@/lib/types"

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-slate-400 text-white",
}

interface TaskCardProps {
  task: TaskWithAssignee
  onRefresh: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onRefresh, isDragging }: TaskCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })

  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card
          className={cn("cursor-pointer hover:shadow-md transition-shadow", isDragging && "opacity-50 shadow-lg rotate-2")}
          onClick={() => setDetailOpen(true)}
        >
          <CardContent className="p-3 space-y-2">
            <div className="flex items-start gap-2">
              <button {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{task.title}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
                  {task.priority}
                </Badge>
                {task.labels?.map((label) => (
                  <Badge key={label} variant="outline" className="text-[10px] px-1.5 py-0">{label}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {task.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.due_date), "MMM d")}
                  </span>
                )}
              </div>
              {task.assignee && (
                <UserAvatar name={task.assignee.full_name || ""} avatarUrl={task.assignee.avatar_url} size="sm" showTooltip />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{task.title}</DialogTitle></DialogHeader>
          <TaskDetailDialog task={task} onClose={() => setDetailOpen(false)} onRefresh={onRefresh} />
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { format } from "date-fns"
import type { TaskWithAssignee } from "@/lib/types"

const priorityColors: Record<string, string> = {
  urgent: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
}

export default function ListViewPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const supabase = useSupabase()
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select(
          "*, assignee:profiles!assignee_id(*), reporter:profiles!reporter_id(*)"
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
      setTasks((data as unknown as TaskWithAssignee[]) || [])
      setLoading(false)
    }
    fetchTasks()
  }, [projectId, supabase])

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {statusLabels[task.status] || task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityColors[task.priority] as any}>
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      name={task.assignee.full_name || ""}
                      avatarUrl={task.assignee.avatar_url}
                      size="sm"
                    />
                    <span className="text-sm">{task.assignee.full_name}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {task.due_date
                  ? format(new Date(task.due_date), "MMM d, yyyy")
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No tasks in this project
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

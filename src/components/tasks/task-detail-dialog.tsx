"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { toast } from "sonner"
import type { TaskWithAssignee, TaskComment, Profile } from "@/lib/types"

interface TaskDetailDialogProps {
  task: TaskWithAssignee
  onClose: () => void
  onRefresh: () => void
}

export function TaskDetailDialog({ task, onClose, onRefresh }: TaskDetailDialogProps) {
  const supabase = useSupabase()
  const { profile, organization } = useOrg()
  const [comments, setComments] = useState<(TaskComment & { user: Profile })[]>([])
  const [newComment, setNewComment] = useState("")
  const [status, setStatus] = useState(task.status)
  const [priority, setPriority] = useState(task.priority)

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("task_comments")
        .select("*, user:profiles!user_id(*)")
        .eq("task_id", task.id)
        .order("created_at", { ascending: true })
      setComments((data as any) || [])
    }
    fetchComments()
  }, [task.id, supabase])

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus as any)
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id)
    toast.success("Status updated")
    onRefresh()
  }

  const handlePriorityChange = async (newPriority: string) => {
    setPriority(newPriority as any)
    await supabase.from("tasks").update({ priority: newPriority }).eq("id", task.id)
    toast.success("Priority updated")
    onRefresh()
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !profile) return
    await supabase.from("task_comments").insert({ task_id: task.id, user_id: profile.id, content: newComment })
    // Log activity
    if (organization) {
      await supabase.from("activity_log").insert({
        organization_id: organization.id,
        entity_type: "task",
        entity_id: task.id,
        action: "comment_added",
        actor_id: profile.id,
        metadata: { comment: newComment.substring(0, 100) },
      })
    }
    setNewComment("")
    // Refresh comments
    const { data } = await supabase
      .from("task_comments")
      .select("*, user:profiles!user_id(*)")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true })
    setComments((data as any) || [])
    toast.success("Comment added")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Priority</label>
          <Select value={priority} onValueChange={handlePriorityChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Assignee:</span>
          <div className="flex items-center gap-2 mt-1">
            {task.assignee ? (
              <><UserAvatar name={task.assignee.full_name || ""} avatarUrl={task.assignee.avatar_url} size="sm" />
              <span>{task.assignee.full_name}</span></>
            ) : <span className="text-muted-foreground">Unassigned</span>}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Due Date:</span>
          <p className="mt-1">{task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "No due date"}</p>
        </div>
      </div>
      {task.description && (
        <div>
          <span className="text-sm text-muted-foreground">Description:</span>
          <p className="mt-1 text-sm whitespace-pre-wrap">{task.description}</p>
        </div>
      )}
      <Separator />
      <div>
        <h4 className="font-semibold text-sm mb-3">Comments ({comments.length})</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <UserAvatar name={comment.user?.full_name || ""} avatarUrl={comment.user?.avatar_url} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.user?.full_name}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(comment.created_at), "MMM d, h:mm a")}</span>
                </div>
                <p className="text-sm mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px]" onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddComment() }} />
          <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

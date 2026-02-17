"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee_id: z.string().nullable().optional(),
  due_date: z.date().nullable().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  projectId: string
  onSuccess: () => void
  defaultValues?: Partial<TaskFormValues>
  taskId?: string
}

export function TaskForm({ projectId, onSuccess, defaultValues, taskId }: TaskFormProps) {
  const supabase = useSupabase()
  const { organization, profile } = useOrg()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Profile[]>([])

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", status: "todo", priority: "medium", assignee_id: null, due_date: null, ...defaultValues },
  })

  useEffect(() => {
    if (!organization) return
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("organization_members")
        .select("user:profiles!user_id(*)")
        .eq("organization_id", organization.id)
      setMembers(data?.map((d: any) => d.user).filter(Boolean) || [])
    }
    fetchMembers()
  }, [organization, supabase])

  const onSubmit = async (values: TaskFormValues) => {
    if (!organization || !profile) return
    setLoading(true)
    try {
      const taskData = {
        ...values,
        due_date: values.due_date?.toISOString() || null,
        project_id: projectId,
        organization_id: organization.id,
        reporter_id: profile.id,
        position: Date.now(),
      }
      if (taskId) {
        await supabase.from("tasks").update(taskData).eq("id", taskId)
        toast.success("Task updated")
      } else {
        await supabase.from("tasks").insert(taskData)
        toast.success("Task created")
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input placeholder="Task title" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Describe the task..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />
          <FormField control={form.control} name="assignee_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>{member.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="due_date" render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : taskId ? "Update Task" : "Create Task"}
        </Button>
      </form>
    </Form>
  )
}

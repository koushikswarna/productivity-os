"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { toast } from "sonner"

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  onSuccess: () => void
  defaultValues?: Partial<ProjectFormValues>
  projectId?: string
}

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"]

export function ProjectForm({ onSuccess, defaultValues, projectId }: ProjectFormProps) {
  const supabase = useSupabase()
  const { organization, profile } = useOrg()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", color: "#6366f1", ...defaultValues },
  })

  const onSubmit = async (values: ProjectFormValues) => {
    if (!organization || !profile) return
    setLoading(true)
    try {
      if (projectId) {
        await supabase.from("projects").update(values).eq("id", projectId)
        toast.success("Project updated")
      } else {
        const { data, error } = await supabase.from("projects").insert({
          ...values,
          organization_id: organization.id,
          created_by: profile.id,
        }).select().single()
        if (error) throw error
        // Also add creator as project member
        if (data) {
          await supabase.from("project_members").insert({
            project_id: data.id,
            user_id: profile.id,
            role: "owner",
          })
        }
        toast.success("Project created")
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
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name</FormLabel>
            <FormControl><Input placeholder="My Project" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Describe your project..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="color" render={({ field }) => (
          <FormItem>
            <FormLabel>Color</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => field.onChange(color)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${field.value === color ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </FormControl>
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : projectId ? "Update Project" : "Create Project"}
        </Button>
      </form>
    </Form>
  )
}

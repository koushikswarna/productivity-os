"use client"

import { useEffect, useState } from "react"
import { Plus, FolderKanban, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { ProjectForm } from "@/components/tasks/project-form"
import Link from "next/link"
import { toast } from "sonner"
import type { Project } from "@/lib/types"

export default function ProjectsPage() {
  const supabase = useSupabase()
  const { organization, isLoading: orgLoading } = useOrg()
  const [projects, setProjects] = useState<Project[]>([])
  const [taskCounts, setTaskCounts] = useState<Record<string, { total: number; done: number }>>({})
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!organization) return
    try {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError
      setProjects(data || [])

      // Fetch task counts per project
      if (data && data.length > 0) {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("project_id, status")
          .in("project_id", data.map((p) => p.id))

        if (tasks) {
          const counts: Record<string, { total: number; done: number }> = {}
          tasks.forEach((t) => {
            if (!counts[t.project_id]) counts[t.project_id] = { total: 0, done: 0 }
            counts[t.project_id].total++
            if (t.status === "done") counts[t.project_id].done++
          })
          setTaskCounts(counts)
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load projects")
      toast.error("Failed to load projects")
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!orgLoading) fetchProjects()
  }, [organization, orgLoading, supabase])

  if (loading || orgLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your team&apos;s work
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSuccess={() => { setDialogOpen(false); fetchProjects() }} />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            {error}. <button className="underline" onClick={fetchProjects}>Try again</button>
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Create your first project</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Projects are where your team organizes and tracks work.
            </p>
            <div className="mt-6">
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Create a Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const counts = taskCounts[project.id] || { total: 0, done: 0 }
            const progress = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-all hover:border-primary/20 cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {counts.done}/{counts.total} tasks done
                      </span>
                      {counts.total > 0 && (
                        <Badge variant={progress === 100 ? "default" : "secondary"}>
                          {progress}%
                        </Badge>
                      )}
                    </div>
                    {counts.total > 0 && (
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Plus, Sparkles, LayoutList, Columns3, X, AlertTriangle, Target, Zap, ArrowRight, CheckCircle2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskForm } from "@/components/tasks/task-form"
import { toast } from "sonner"
import type { TaskWithAssignee, Project } from "@/lib/types"

export default function ProjectBoardPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const supabase = useSupabase()
  const { organization } = useOrg()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<TaskWithAssignee[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiResults, setAiResults] = useState<any>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)

  const fetchTasks = async () => {
    if (!organization) return
    const { data: projectData } = await supabase.from("projects").select("*").eq("id", projectId).single()
    setProject(projectData)
    const { data: taskData } = await supabase
      .from("tasks")
      .select("*, assignee:profiles!assignee_id(*), reporter:profiles!reporter_id(*)")
      .eq("project_id", projectId)
      .order("position", { ascending: true })
    setTasks((taskData as unknown as TaskWithAssignee[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [projectId, organization, supabase])

  const handleAnalyzePriorities = async () => {
    if (!organization) return
    setAnalyzing(true)
    try {
      const res = await fetch("/api/ai/priorities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id, projectId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to analyze")
      }
      const data = await res.json()
      const parsed = JSON.parse(data.result)
      setAiResults(parsed)
      setShowAiPanel(true)
      toast.success("AI analysis complete!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const severityBadgeVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive" as const
      case "medium":
        return "secondary" as const
      case "low":
        return "outline" as const
      default:
        return "secondary" as const
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-[600px]" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: project?.color || "#6366f1" }} />
          <h1 className="text-2xl font-bold">{project?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAnalyzePriorities} disabled={analyzing}>
            <Sparkles className="mr-2 h-4 w-4" />
            {analyzing ? "Analyzing..." : "AI Priorities"}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Task</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
              <TaskForm projectId={projectId} onSuccess={() => { setDialogOpen(false); fetchTasks() }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <KanbanBoard tasks={tasks} onTasksChange={setTasks} projectId={projectId} onRefresh={fetchTasks} />

      {showAiPanel && aiResults && (
        <Card className="border rounded-lg bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">AI Priority Analysis</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowAiPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiResults.bottlenecks && aiResults.bottlenecks.length > 0 && (
                <Card className="border rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="max-h-[240px]">
                      <div className="space-y-3">
                        {aiResults.bottlenecks.map((item: any, idx: number) => (
                          <div key={idx} className="rounded-md border bg-background p-3 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium leading-tight">{item.issue}</p>
                              <Badge variant={severityBadgeVariant(item.severity)} className="shrink-0 text-xs">
                                {item.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {aiResults.recommendations && aiResults.recommendations.length > 0 && (
                <Card className="border rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="max-h-[240px]">
                      <div className="space-y-3">
                        {aiResults.recommendations.map((item: any, idx: number) => (
                          <div key={idx} className="rounded-md border bg-background p-3 space-y-1.5">
                            <p className="text-sm font-medium">{item.task}</p>
                            <div className="flex items-start gap-1.5">
                              <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{item.action}</p>
                            </div>
                            <p className="text-xs text-muted-foreground italic">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {aiResults.risk_areas && aiResults.risk_areas.length > 0 && (
                <Card className="border rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <CardTitle className="text-sm font-medium">Risk Areas</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="max-h-[240px]">
                      <div className="space-y-3">
                        {aiResults.risk_areas.map((item: any, idx: number) => (
                          <div key={idx} className="rounded-md border bg-background p-3 space-y-1.5">
                            <p className="text-sm font-medium">{item.area}</p>
                            <p className="text-xs text-muted-foreground">{item.impact}</p>
                            <div className="flex items-start gap-1.5">
                              <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-green-500" />
                              <p className="text-xs text-muted-foreground">{item.mitigation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {aiResults.workload_balance && (
                <Card className="border rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-violet-500" />
                      <CardTitle className="text-sm font-medium">Workload Balance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {aiResults.workload_balance}
                    </p>
                  </CardContent>
                </Card>
              )}

              {aiResults.suggested_focus && aiResults.suggested_focus.length > 0 && (
                <Card className="border rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <CardTitle className="text-sm font-medium">Suggested Focus</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ol className="space-y-2">
                      {aiResults.suggested_focus.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {aiResults.quick_wins && aiResults.quick_wins.length > 0 && (
                <Card className="border rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <CardTitle className="text-sm font-medium">Quick Wins</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {aiResults.quick_wins.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

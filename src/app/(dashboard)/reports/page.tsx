"use client"
import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Sparkles,
  FileDown,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { DashboardGrid } from "@/components/reports/dashboard-grid"
import { AIReportGenerator } from "@/components/reports/ai-report-generator"
import { toast } from "sonner"

export default function ReportsPage() {
  const supabase = useSupabase()
  const { organization, isLoading: orgLoading } = useOrg()
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    in_progress: 0,
    overdue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAIReport, setShowAIReport] = useState(false)

  const fetchData = useCallback(async () => {
    if (!organization) return
    setLoading(true)
    setError(null)
    try {
      const { data: tasks, error: fetchError } = await supabase
        .from("tasks")
        .select("status, due_date")
        .eq("organization_id", organization.id)

      if (fetchError) throw fetchError

      if (tasks) {
        const now = new Date()
        setTaskStats({
          total: tasks.length,
          completed: tasks.filter((t) => t.status === "done").length,
          in_progress: tasks.filter((t) => t.status === "in_progress").length,
          overdue: tasks.filter(
            (t) =>
              t.due_date && new Date(t.due_date) < now && t.status !== "done"
          ).length,
        })
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load report data"
      setError(message)
      toast.error("Could not load reports. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [organization, supabase])

  useEffect(() => {
    if (!organization) return
    fetchData()
  }, [organization, fetchData])

  const completionRate =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0

  // --- Loading states ---
  if (orgLoading || (loading && !error)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-80" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Unable to load reports</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {error}. Check your connection and try again.
        </p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Track progress and generate AI reports
          </p>
        </div>
        <Button onClick={() => setShowAIReport(true)}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate AI Report
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <ClipboardList className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{taskStats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {taskStats.completed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {taskStats.in_progress}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {taskStats.overdue}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {taskStats.overdue > 0 ? "Needs attention" : "All on schedule"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion rate bar */}
      {taskStats.total > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Overall Completion</p>
              <p className="text-sm font-bold">{completionRate}%</p>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {taskStats.completed} of {taskStats.total} tasks completed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dashboard grid */}
      <DashboardGrid organizationId={organization?.id || ""} />

      {/* AI Report dialog */}
      {showAIReport && (
        <AIReportGenerator
          organizationId={organization?.id || ""}
          onClose={() => setShowAIReport(false)}
        />
      )}
    </div>
  )
}

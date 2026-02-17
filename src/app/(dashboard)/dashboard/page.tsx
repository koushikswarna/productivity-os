"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FolderKanban, MessageSquare, FileText, CheckCircle2, Clock,
  AlertTriangle, TrendingUp, Users, ArrowRight, Sparkles,
  BarChart3, Rocket, BookOpen, Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { format } from "date-fns"

interface SetupStep {
  id: string
  title: string
  description: string
  href: string
  icon: any
  completed: boolean
}

export default function DashboardPage() {
  const supabase = useSupabase()
  const { organization, profile, isLoading: orgLoading } = useOrg()
  const [stats, setStats] = useState({
    projects: 0, tasks: 0, completed: 0, overdue: 0,
    channels: 0, documents: 0, members: 0,
  })
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!organization || orgLoading) return
    const fetchData = async () => {
      try {
        const [
          { count: projectCount },
          { data: tasks },
          { count: channelCount },
          { count: docCount },
          { count: memberCount },
          { data: activity },
        ] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("organization_id", organization.id),
          supabase.from("tasks").select("status, due_date, title, priority, id, created_at, assignee_id").eq("organization_id", organization.id),
          supabase.from("channels").select("*", { count: "exact", head: true }).eq("organization_id", organization.id),
          supabase.from("documents").select("*", { count: "exact", head: true }).eq("organization_id", organization.id),
          supabase.from("organization_members").select("*", { count: "exact", head: true }).eq("organization_id", organization.id),
          supabase.from("activity_log").select("*, actor:profiles!actor_id(full_name)").eq("organization_id", organization.id).order("created_at", { ascending: false }).limit(5),
        ])

        const now = new Date()
        const taskList = tasks || []
        const completedCount = taskList.filter((t) => t.status === "done").length
        const overdueCount = taskList.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== "done").length

        setStats({
          projects: projectCount || 0,
          tasks: taskList.length,
          completed: completedCount,
          overdue: overdueCount,
          channels: channelCount || 0,
          documents: docCount || 0,
          members: memberCount || 0,
        })

        setRecentTasks(
          taskList
            .filter((t) => t.status !== "done")
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
        )

        setRecentActivity((activity as any) || [])

        // Calculate setup progress
        setSetupSteps([
          {
            id: "project",
            title: "Create a project",
            description: "Create a project board",
            href: "/projects",
            icon: FolderKanban,
            completed: (projectCount || 0) > 0,
          },
          {
            id: "task",
            title: "Add tasks to your project",
            description: "Add your first tasks",
            href: "/projects",
            icon: CheckCircle2,
            completed: taskList.length > 0,
          },
          {
            id: "chat",
            title: "Send a message in chat",
            description: "Chat with your team",
            href: "/chat",
            icon: MessageSquare,
            completed: (channelCount || 0) > 0,
          },
          {
            id: "document",
            title: "Create a document",
            description: "Write a team doc",
            href: "/documents",
            icon: FileText,
            completed: (docCount || 0) > 0,
          },
          {
            id: "members",
            title: "Invite a team member",
            description: "Grow your team",
            href: "/settings/members",
            icon: Users,
            completed: (memberCount || 0) > 1,
          },
        ])
      } catch (error) {
        console.error("Dashboard fetch error:", error)
      }
      setLoading(false)
    }
    fetchData()
  }, [organization, orgLoading, supabase])

  if (loading || orgLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const completedSteps = setupSteps.filter((s) => s.completed).length
  const setupProgress = setupSteps.length > 0 ? (completedSteps / setupSteps.length) * 100 : 0
  const showSetup = setupProgress < 100

  const priorityColors: Record<string, string> = {
    urgent: "text-red-600 bg-red-50 dark:bg-red-950",
    high: "text-orange-600 bg-orange-50 dark:bg-orange-950",
    medium: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
    low: "text-slate-600 bg-slate-50 dark:bg-slate-950",
  }

  const statusColors: Record<string, string> = {
    todo: "bg-slate-400",
    in_progress: "bg-blue-500",
    in_review: "bg-yellow-500",
    done: "bg-green-500",
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening in <strong>{organization?.name}</strong> today
        </p>
      </div>

      {/* Getting Started Checklist */}
      {showSetup && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Getting Started</CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedSteps}/{setupSteps.length} complete
              </span>
            </div>
            <Progress value={setupProgress} className="h-2 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {setupSteps.map((step) => (
                <Link key={step.id} href={step.href}>
                  <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
                    step.completed
                      ? "bg-muted/50 opacity-60"
                      : "bg-background hover:border-primary/30"
                  }`}>
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      step.completed
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-primary/10"
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <step.icon className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${step.completed ? "line-through" : ""}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/projects">
          <Card className="hover:shadow-md transition-all hover:border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center">
                <FolderKanban className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.projects}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/projects">
          <Card className="hover:shadow-md transition-all hover:border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.completed}/{stats.tasks}</p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/members">
          <Card className="hover:shadow-md transition-all hover:border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.members}</p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/projects">
          <Card className="hover:shadow-md transition-all hover:border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className={`text-2xl font-bold mt-2 ${stats.overdue > 0 ? "text-red-600" : ""}`}>
                {stats.overdue}
              </p>
              <p className="text-xs text-muted-foreground">Overdue Tasks</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Your Active Tasks</CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm text-muted-foreground">
                    No pending tasks. Create a project and add tasks to get started.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/projects"><FolderKanban className="mr-2 h-4 w-4" />Go to Projects</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusColors[task.status] || "bg-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityColors[task.priority] || ""}`}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions + Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
                  <Link href="/projects">
                    <FolderKanban className="h-4 w-4 text-indigo-500" />
                    Projects
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
                  <Link href="/chat">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    Chat
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
                  <Link href="/documents">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Documents
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
                  <Link href="/reports">
                    <BarChart3 className="h-4 w-4 text-orange-500" />
                    Reports
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs col-span-2" asChild>
                  <Link href="/settings/members">
                    <Users className="h-4 w-4 text-purple-500" />
                    Invite Team Members
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  &mdash;
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="text-xs">
                          <span className="font-medium">{item.actor?.full_name || "Someone"}</span>
                          {" "}{item.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(item.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

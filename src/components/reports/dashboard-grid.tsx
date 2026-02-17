"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { ChartWidget } from "./chart-widget"

interface DashboardGridProps { organizationId: string }

export function DashboardGrid({ organizationId }: DashboardGridProps) {
  const supabase = useSupabase()
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([])
  const [tasksByPriority, setTasksByPriority] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([])

  useEffect(() => {
    if (!organizationId) return
    const fetch = async () => {
      const { data: tasks } = await supabase.from("tasks").select("status, priority, created_at").eq("organization_id", organizationId)
      if (tasks) {
        const statusCounts: Record<string, number> = {}
        const priorityCounts: Record<string, number> = {}
        tasks.forEach((t) => {
          statusCounts[t.status] = (statusCounts[t.status] || 0) + 1
          priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1
        })
        setTasksByStatus(Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })))
        setTasksByPriority(Object.entries(priorityCounts).map(([name, value]) => ({ name, value })))
        // Weekly trend (last 7 days)
        const days: Record<string, number> = {}
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i)
          days[d.toISOString().split("T")[0]] = 0
        }
        tasks.forEach((t) => { const d = t.created_at.split("T")[0]; if (days[d] !== undefined) days[d]++ })
        setWeeklyTrend(Object.entries(days).map(([date, count]) => ({ name: date.slice(5), tasks: count })))
      }
      const { data: activity } = await supabase.from("activity_log").select("action, created_at").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(20)
      setRecentActivity(activity || [])
    }
    fetch()
  }, [organizationId, supabase])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Tasks by Status</CardTitle></CardHeader>
        <CardContent><ChartWidget type="pie" data={tasksByStatus} dataKey="value" nameKey="name" height={250} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Tasks by Priority</CardTitle></CardHeader>
        <CardContent><ChartWidget type="bar" data={tasksByPriority} dataKey="value" nameKey="name" height={250} /></CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader><CardTitle className="text-sm">Tasks Created (Last 7 Days)</CardTitle></CardHeader>
        <CardContent><ChartWidget type="area" data={weeklyTrend} dataKey="tasks" nameKey="name" height={250} /></CardContent>
      </Card>
    </div>
  )
}

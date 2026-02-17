"use client"
import { useEffect, useState, useCallback } from "react"
import {
  Plus,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { KPICard } from "@/components/analytics/kpi-card"
import { KPIForm } from "@/components/analytics/kpi-form"
import { InsightsPanel } from "@/components/analytics/insights-panel"
import { TrendChart } from "@/components/analytics/trend-chart"
import { EmptyState } from "@/components/shared/empty-state"
import { toast } from "sonner"
import type { KPI, KPIEntry, AIInsight } from "@/lib/types"

export default function AnalyticsPage() {
  const supabase = useSupabase()
  const { organization, isLoading: orgLoading } = useOrg()
  const [kpis, setKpis] = useState<(KPI & { entries: KPIEntry[] })[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const fetchData = useCallback(async () => {
    if (!organization) return

    setLoading(true)
    setError(null)

    try {
      const [kpiResult, insightResult] = await Promise.all([
        supabase
          .from("kpis")
          .select("*, entries:kpi_entries(*)")
          .eq("organization_id", organization.id)
          .order("created_at"),
        supabase
          .from("ai_insights")
          .select("*")
          .eq("organization_id", organization.id)
          .order("generated_at", { ascending: false })
          .limit(10),
      ])

      if (kpiResult.error) {
        throw new Error(`Failed to load KPIs: ${kpiResult.error.message}`)
      }
      if (insightResult.error) {
        throw new Error(
          `Failed to load insights: ${insightResult.error.message}`
        )
      }

      setKpis((kpiResult.data as any) || [])
      setInsights(insightResult.data || [])
    } catch (e: any) {
      const message =
        e?.message || "Something went wrong while loading analytics data."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [organization, supabase])

  useEffect(() => {
    if (!orgLoading) {
      fetchData()
    }
  }, [orgLoading, fetchData])

  const generateInsights = async () => {
    if (!organization) return
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id }),
      })

      if (!res.ok) {
        let errorMessage = "Failed to generate insights."
        try {
          const errorBody = await res.json()
          errorMessage = errorBody.error || errorMessage
        } catch {
          // Response body was not valid JSON; use the default message
        }
        throw new Error(errorMessage)
      }

      toast.success("AI insights generated successfully!")
      fetchData()
    } catch (e: any) {
      const message = e?.message || "An unexpected error occurred while generating insights."
      toast.error(message)
    } finally {
      setGenerating(false)
    }
  }

  // ------------------------------------------------------------------
  // Loading state: show while org context or data is loading
  // ------------------------------------------------------------------
  if (orgLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Error state: show a clear message with a retry action
  // ------------------------------------------------------------------
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track KPIs and get AI-powered insights
          </p>
        </div>

        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            Unable to load analytics
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {error}
          </p>
          <Button onClick={fetchData} variant="outline" className="mt-6">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Main render
  // ------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track KPIs and get AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateInsights}
            disabled={generating}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {generating ? "Generating..." : "AI Insights"}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add KPI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create KPI</DialogTitle>
              </DialogHeader>
              <KPIForm
                onSuccess={() => {
                  setDialogOpen(false)
                  fetchData()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty state */}
      {kpis.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No KPIs yet"
          description="Define measurable goals and track your team's progress over time."
          action={{
            label: "Create your first KPI",
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <KPICard
                key={kpi.id}
                kpi={kpi}
                onClick={() =>
                  setSelectedKPI(kpi.id === selectedKPI ? null : kpi.id)
                }
                isSelected={kpi.id === selectedKPI}
                onRefresh={fetchData}
              />
            ))}
          </div>

          {/* Trend chart for the selected KPI */}
          {selectedKPI && (
            <TrendChart kpi={kpis.find((k) => k.id === selectedKPI)!} />
          )}
        </>
      )}

      {/* Insights panel */}
      {insights.length > 0 && <InsightsPanel insights={insights} />}
    </div>
  )
}

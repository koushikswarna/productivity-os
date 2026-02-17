"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import {
  Plus,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [importedData, setImportedData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()

    if (file.name.endsWith(".csv")) {
      const lines = text.split("\n").filter(l => l.trim())
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
      const rows = lines.slice(1).map(line => line.split(",").map(c => c.trim().replace(/^"|"$/g, "")))
      setImportedData({ headers, rows })
      toast.success(`Imported ${rows.length} rows from ${file.name}`)
    } else if (file.name.endsWith(".json")) {
      try {
        const json = JSON.parse(text)
        const arr = Array.isArray(json) ? json : [json]
        const headers = Object.keys(arr[0] || {})
        const rows = arr.map(item => headers.map(h => String(item[h] ?? "")))
        setImportedData({ headers, rows })
        toast.success(`Imported ${rows.length} records from ${file.name}`)
      } catch {
        toast.error("Invalid JSON file")
      }
    }
    if (importRef.current) importRef.current.value = ""
  }

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
          <input type="file" ref={importRef} className="hidden" accept=".csv,.json" onChange={handleImport} />
          <Button variant="outline" onClick={() => importRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
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

      {/* Imported data table */}
      {importedData && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Imported Data</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setImportedData(null)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {importedData.headers.map((h, i) => (
                      <th key={i} className="text-left p-2 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {importedData.rows.slice(0, 10).map((row, ri) => (
                    <tr key={ri} className="border-b last:border-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="p-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {importedData.rows.length > 10 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing 10 of {importedData.rows.length} rows
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights panel */}
      {insights.length > 0 && <InsightsPanel insights={insights} />}
    </div>
  )
}

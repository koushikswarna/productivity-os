"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { format } from "date-fns"
import type { KPI, KPIEntry } from "@/lib/types"

export function TrendChart({ kpi }: { kpi: KPI & { entries: KPIEntry[] } }) {
  const data = (kpi.entries || [])
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((e) => ({ date: format(new Date(e.recorded_at), "MMM d"), value: e.value }))

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{kpi.name} — Trend</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No entries yet. Log values to see trends.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <ReferenceLine y={kpi.target_value} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Target", position: "right" }} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

"use client"
import { useState } from "react"
import { TrendingUp, TrendingDown, Minus, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { KPI, KPIEntry } from "@/lib/types"

interface KPICardProps { kpi: KPI & { entries: KPIEntry[] }; onClick: () => void; isSelected: boolean; onRefresh: () => void }

export function KPICard({ kpi, onClick, isSelected, onRefresh }: KPICardProps) {
  const supabase = useSupabase()
  const [newValue, setNewValue] = useState("")
  const [popoverOpen, setPopoverOpen] = useState(false)

  const progress = kpi.target_value > 0 ? Math.min(100, (kpi.current_value / kpi.target_value) * 100) : 0
  const lastEntry = kpi.entries?.[kpi.entries.length - 1]
  const prevEntry = kpi.entries?.[kpi.entries.length - 2]
  const trend = lastEntry && prevEntry ? lastEntry.value - prevEntry.value : 0

  const logEntry = async () => {
    if (!newValue) return
    const val = parseFloat(newValue)
    if (isNaN(val)) { toast.error("Invalid number"); return }
    await supabase.from("kpi_entries").insert({ kpi_id: kpi.id, value: val })
    await supabase.from("kpis").update({ current_value: val }).eq("id", kpi.id)
    setNewValue(""); setPopoverOpen(false); toast.success("Value logged"); onRefresh()
  }

  return (
    <Card className={cn("cursor-pointer transition-all hover:shadow-md", isSelected && "ring-2 ring-primary")} onClick={onClick}>
      <CardHeader className="pb-2 flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.name}</CardTitle>
          <p className="text-xs text-muted-foreground">{kpi.category} · {kpi.tracking_period}</p>
        </div>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              <Input type="number" placeholder="Enter value" value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") logEntry() }} />
              <Button size="sm" className="w-full" onClick={logEntry}>Log</Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{kpi.current_value.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground mb-1">{kpi.unit}</span>
          {trend !== 0 && (
            <span className={cn("flex items-center text-xs ml-auto", trend > 0 ? "text-green-600" : "text-red-600")}>
              {trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
              {Math.abs(trend).toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progress.toFixed(0)}% of {kpi.target_value.toLocaleString()} {kpi.unit}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

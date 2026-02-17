"use client"

import { useState } from "react"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import ReactMarkdown from "react-markdown"
import type { AIInsight } from "@/lib/types"

function tryParseJSON(content: unknown): { parsed: true; data: any } | { parsed: false; text: string } {
  if (typeof content === "string") {
    try {
      const data = JSON.parse(content)
      return { parsed: true, data }
    } catch {
      return { parsed: false, text: content }
    }
  }
  if (typeof content === "object" && content !== null) {
    return { parsed: true, data: content }
  }
  return { parsed: false, text: String(content) }
}

function DirectionArrow({ direction }: { direction: string }) {
  const d = direction?.toLowerCase()
  if (d === "up" || d === "increasing") {
    return <TrendingUp className="h-3.5 w-3.5 text-green-600" />
  }
  if (d === "down" || d === "decreasing") {
    return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

function severityVariant(severity: string): "destructive" | "secondary" | "outline" {
  const s = severity?.toLowerCase()
  if (s === "high" || s === "critical") return "destructive"
  if (s === "medium" || s === "moderate") return "secondary"
  return "outline"
}

function urgencyColor(urgency: string): string {
  const u = urgency?.toLowerCase()
  if (u === "high" || u === "critical" || u === "urgent") return "text-red-600"
  if (u === "medium" || u === "moderate") return "text-yellow-600"
  return "text-muted-foreground"
}

function OrganizationalInsightsContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {data.overall_health && (
        <div className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase text-primary">Overall Health</span>
          </div>
          <p className="text-sm">{typeof data.overall_health === "string" ? data.overall_health : JSON.stringify(data.overall_health)}</p>
        </div>
      )}

      {Array.isArray(data.trends) && data.trends.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Trends</h4>
          <div className="space-y-2">
            {data.trends.map((trend: any, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-md border px-3 py-2">
                <DirectionArrow direction={trend.direction} />
                <div className="flex-1 min-w-0">
                  {trend.metric && <span className="text-xs font-medium text-primary">{trend.metric}</span>}
                  <p className="text-sm">{trend.description || trend.summary || (typeof trend === "string" ? trend : JSON.stringify(trend))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.anomalies) && data.anomalies.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Anomalies</h4>
          <div className="space-y-2">
            {data.anomalies.map((anomaly: any, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-md border px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {anomaly.severity && (
                      <Badge variant={severityVariant(anomaly.severity)} className="text-[10px] px-1.5 py-0">
                        {anomaly.severity}
                      </Badge>
                    )}
                    {anomaly.metric && <span className="text-xs font-medium">{anomaly.metric}</span>}
                  </div>
                  <p className="text-sm">{anomaly.description || anomaly.summary || (typeof anomaly === "string" ? anomaly : JSON.stringify(anomaly))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Recommendations</h4>
          <div className="space-y-2">
            {data.recommendations.map((rec: any, i: number) => (
              <div key={i} className="rounded-md border bg-muted/30 px-3 py-2">
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    {rec.title && <p className="text-sm font-medium">{rec.title}</p>}
                    <p className="text-sm">{rec.description || rec.action || (typeof rec === "string" ? rec : JSON.stringify(rec))}</p>
                    {rec.impact && <p className="text-xs text-muted-foreground mt-1">Impact: {rec.impact}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ChatSummaryContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {data.summary && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Summary</h4>
          <p className="text-sm">{data.summary}</p>
        </div>
      )}

      {Array.isArray(data.topics) && data.topics.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Topics</h4>
          <div className="flex flex-wrap gap-1.5">
            {data.topics.map((topic: any, i: number) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {typeof topic === "string" ? topic : topic.name || JSON.stringify(topic)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.key_decisions) && data.key_decisions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Decisions</h4>
          <ul className="space-y-1">
            {data.key_decisions.map((decision: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-green-600 shrink-0" />
                <span>{typeof decision === "string" ? decision : decision.description || JSON.stringify(decision)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(data.action_items) && data.action_items.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Action Items</h4>
          <div className="space-y-2">
            {data.action_items.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-md border px-3 py-2">
                <Target className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{typeof item === "string" ? item : item.description || item.task || JSON.stringify(item)}</p>
                    {item.urgency && (
                      <span className={`text-[10px] font-medium uppercase ${urgencyColor(item.urgency)}`}>
                        {item.urgency}
                      </span>
                    )}
                  </div>
                  {item.assignee && <p className="text-xs text-muted-foreground mt-0.5">Assigned to: {item.assignee}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.unresolved) && data.unresolved.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Unresolved</h4>
          <ul className="space-y-1">
            {data.unresolved.map((item: any, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" />
                <span>{typeof item === "string" ? item : item.description || JSON.stringify(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.sentiment && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Sentiment</h4>
          <p className="text-sm">{typeof data.sentiment === "string" ? data.sentiment : JSON.stringify(data.sentiment)}</p>
        </div>
      )}
    </div>
  )
}

function TaskPrioritiesContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {data.suggested_focus && (
        <div className="rounded-md bg-primary/10 border border-primary/20 px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase text-primary">Suggested Focus</span>
          </div>
          <p className="text-sm">{typeof data.suggested_focus === "string" ? data.suggested_focus : JSON.stringify(data.suggested_focus)}</p>
        </div>
      )}

      {Array.isArray(data.bottlenecks) && data.bottlenecks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Bottlenecks</h4>
          <div className="space-y-2">
            {data.bottlenecks.map((bottleneck: any, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-md border px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {bottleneck.severity && (
                      <Badge variant={severityVariant(bottleneck.severity)} className="text-[10px] px-1.5 py-0">
                        {bottleneck.severity}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{bottleneck.description || bottleneck.issue || (typeof bottleneck === "string" ? bottleneck : JSON.stringify(bottleneck))}</p>
                  {bottleneck.impact && <p className="text-xs text-muted-foreground mt-0.5">Impact: {bottleneck.impact}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Recommendations</h4>
          <div className="space-y-2">
            {data.recommendations.map((rec: any, i: number) => (
              <div key={i} className="rounded-md border bg-muted/30 px-3 py-2">
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                  <p className="text-sm">{rec.description || rec.action || (typeof rec === "string" ? rec : JSON.stringify(rec))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.risk_areas) && data.risk_areas.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Risk Areas</h4>
          <div className="space-y-2">
            {data.risk_areas.map((risk: any, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-destructive shrink-0" />
                <p className="text-sm">{risk.description || risk.area || (typeof risk === "string" ? risk : JSON.stringify(risk))}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.workload_balance && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Workload Balance</h4>
          <p className="text-sm">{typeof data.workload_balance === "string" ? data.workload_balance : JSON.stringify(data.workload_balance)}</p>
        </div>
      )}

      {Array.isArray(data.quick_wins) && data.quick_wins.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Quick Wins</h4>
          <div className="space-y-2">
            {data.quick_wins.map((win: any, i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30 px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-green-600 shrink-0" />
                <p className="text-sm">{win.description || win.action || (typeof win === "string" ? win : JSON.stringify(win))}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReportContent({ text }: { text: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  )
}

function InsightContent({ insight }: { insight: AIInsight }) {
  const contentStr = typeof insight.content === "string" ? insight.content : JSON.stringify(insight.content)
  const result = tryParseJSON(insight.content)

  if (insight.type?.endsWith("_report")) {
    const text = result.parsed && typeof result.data === "object" && result.data?.report
      ? String(result.data.report)
      : contentStr
    return <ReportContent text={text} />
  }

  if (result.parsed) {
    const data = result.data

    if (insight.type === "organizational_insights") {
      return <OrganizationalInsightsContent data={data} />
    }

    if (insight.type === "chat_summary") {
      return <ChatSummaryContent data={data} />
    }

    if (insight.type === "task_priorities") {
      return <TaskPrioritiesContent data={data} />
    }

    return (
      <pre className="text-sm whitespace-pre-wrap break-words bg-muted/30 rounded-md p-3 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    )
  }

  return <p className="text-sm whitespace-pre-wrap">{contentStr}</p>
}

function insightPreview(insight: AIInsight): string {
  const contentStr = typeof insight.content === "string" ? insight.content : JSON.stringify(insight.content)
  const result = tryParseJSON(insight.content)

  if (result.parsed && typeof result.data === "object" && result.data !== null) {
    const data = result.data
    if (insight.type === "organizational_insights" && data.overall_health) {
      return typeof data.overall_health === "string" ? data.overall_health : JSON.stringify(data.overall_health)
    }
    if (insight.type === "chat_summary" && data.summary) {
      return data.summary
    }
    if (insight.type === "task_priorities" && data.suggested_focus) {
      return typeof data.suggested_focus === "string" ? data.suggested_focus : JSON.stringify(data.suggested_focus)
    }
  }

  const plain = contentStr.replace(/[{}\[\]"]/g, " ").replace(/\s+/g, " ").trim()
  return plain
}

function typeLabel(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function InsightItem({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(false)
  const preview = insightPreview(insight)

  return (
    <div className="rounded-lg bg-muted/50 border overflow-hidden">
      <button
        type="button"
        className="w-full text-left p-3 hover:bg-muted/80 transition-colors"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="text-xs font-medium uppercase text-primary">{typeLabel(insight.type)}</span>
          </div>
          <span className="text-xs text-muted-foreground">{format(new Date(insight.generated_at), "MMM d, h:mm a")}</span>
        </div>
        {!expanded && (
          <p className="text-sm text-muted-foreground line-clamp-2 pl-5.5 ml-[22px]">
            {preview}
          </p>
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-0">
          <InsightContent insight={insight} />
        </div>
      )}
    </div>
  )
}

export function InsightsPanel({ insights }: { insights: AIInsight[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {insights.map((insight) => (
              <InsightItem key={insight.id} insight={insight} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

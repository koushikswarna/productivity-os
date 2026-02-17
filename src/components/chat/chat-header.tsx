"use client"
import { useEffect, useState } from "react"
import { Hash, Sparkles, Users, X, CheckCircle2, AlertCircle, MessageSquare, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { toast } from "sonner"
import type { Channel } from "@/lib/types"

interface ActionItem {
  task: string
  assignee: string
  urgency: "high" | "medium" | "low"
}

interface SummaryData {
  summary: string
  key_decisions: string[]
  action_items: ActionItem[]
  topics: string[]
  unresolved: string[]
  sentiment: "positive" | "neutral" | "negative"
}

export function ChatHeader({ channelId }: { channelId: string }) {
  const supabase = useSupabase()
  const { organization } = useOrg()
  const [channel, setChannel] = useState<Channel | null>(null)
  const [summarizing, setSummarizing] = useState(false)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    supabase.from("channels").select("*").eq("id", channelId).single().then(({ data }) => setChannel(data))
  }, [channelId, supabase])

  const handleSummarize = async () => {
    if (!organization) return
    setSummarizing(true)
    try {
      const { data: msgs } = await supabase.from("messages").select("content, created_at, user:profiles!user_id(full_name)")
        .eq("channel_id", channelId).order("created_at", { ascending: false }).limit(50)
      const res = await fetch("/api/ai/summarize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat", organizationId: organization.id,
          data: { messages: msgs?.map((m: any) => ({ user: m.user?.full_name || "Unknown", content: m.content, timestamp: m.created_at })) },
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      const parsed: SummaryData = JSON.parse(data.result)
      setSummaryData(parsed)
      setShowSummary(true)
      toast.success("AI summary ready!")
    } catch (e: any) { toast.error(e.message) }
    finally { setSummarizing(false) }
  }

  const sentimentConfig = {
    positive: { label: "Positive", className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800" },
    neutral: { label: "Neutral", className: "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-300 border-gray-200 dark:border-gray-700" },
    negative: { label: "Negative", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800" },
  }

  const urgencyVariant = (urgency: string): "destructive" | "secondary" | "outline" => {
    if (urgency === "high") return "destructive"
    if (urgency === "medium") return "secondary"
    return "outline"
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">{channel?.name || "Channel"}</h2>
          {channel?.description && <span className="text-sm text-muted-foreground hidden md:inline">— {channel.description}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSummarize} disabled={summarizing}>
            <Sparkles className="h-4 w-4 mr-1" />{summarizing ? "Summarizing..." : "Summarize"}
          </Button>
          <Button variant="ghost" size="icon"><Users className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* AI Summary Panel */}
      {showSummary && summaryData && (
        <div className="border-b bg-gradient-to-b from-purple-50/80 to-transparent dark:from-purple-950/20">
          <ScrollArea className="max-h-80">
            <div className="px-4 py-3 space-y-3">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">AI Conversation Summary</h3>
                  <Badge
                    variant="outline"
                    className={`text-xs ${sentimentConfig[summaryData.sentiment]?.className || sentimentConfig.neutral.className}`}
                  >
                    {sentimentConfig[summaryData.sentiment]?.label || "Neutral"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowSummary(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Summary */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Summary</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{summaryData.summary}</p>
              </div>

              {/* Topics */}
              {summaryData.topics.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topics</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {summaryData.topics.map((topic, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs font-normal bg-purple-100/60 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Decisions */}
              {summaryData.key_decisions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Decisions</span>
                  </div>
                  <ul className="space-y-1">
                    {summaryData.key_decisions.map((decision, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500 dark:text-green-400" />
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {summaryData.action_items.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ListChecks className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Action Items</span>
                  </div>
                  <ul className="space-y-1.5">
                    {summaryData.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Badge variant={urgencyVariant(item.urgency)} className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5 uppercase">
                          {item.urgency}
                        </Badge>
                        <span className="text-foreground/90">{item.task}</span>
                        {item.assignee && (
                          <span className="text-xs text-muted-foreground shrink-0">@ {item.assignee}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unresolved */}
              {summaryData.unresolved.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unresolved</span>
                  </div>
                  <ul className="space-y-1">
                    {summaryData.unresolved.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

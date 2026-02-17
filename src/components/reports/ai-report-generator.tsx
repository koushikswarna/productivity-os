"use client"
import { useState, useEffect, useRef } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"

interface AIReportGeneratorProps { organizationId: string; onClose: () => void }

export function AIReportGenerator({ organizationId, onClose }: AIReportGeneratorProps) {
  const [reportType, setReportType] = useState<"weekly" | "sprint" | "performance">("weekly")
  const [content, setContent] = useState("")
  const [generating, setGenerating] = useState(false)
  const contentRef = useRef("")

  const generate = async () => {
    setGenerating(true)
    setContent("")
    contentRef.current = ""
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, type: reportType, period: "Last 7 days" }),
      })
      if (!res.ok) throw new Error("Failed to generate report")
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value)
          contentRef.current += text
          setContent(contentRef.current)
        }
      }
    } catch (e: any) {
      setContent("Error generating report: " + e.message)
    }
    setGenerating(false)
  }

  return (
    <Card className="fixed inset-4 z-50 flex flex-col shadow-2xl">
      <CardHeader className="flex-row items-center justify-between border-b">
        <CardTitle>AI Report Generator</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="sprint">Sprint</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={generating}>
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {generating ? "Generating..." : "Generate"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6">
          {content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Select a report type and click Generate
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

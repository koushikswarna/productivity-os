"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Sparkles, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Editor } from "@/components/documents/editor"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { toast } from "sonner"
import { format } from "date-fns"
import type { Document, DocumentVersion } from "@/lib/types"

export default function DocumentPage() {
  const params = useParams()
  const docId = params.documentId as string
  const router = useRouter()
  const supabase = useSupabase()
  const { organization, profile } = useOrg()
  const [doc, setDoc] = useState<Document | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState<any>({})
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [summarizing, setSummarizing] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("documents").select("*").eq("id", docId).single()
      if (data) { setDoc(data); setTitle(data.title); setContent(data.content || {}) }
      const { data: vers } = await supabase.from("document_versions").select("*").eq("document_id", docId).order("created_at", { ascending: false })
      setVersions(vers || [])
      setLoading(false)
    }
    fetch()
  }, [docId, supabase])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    // Save version
    await supabase.from("document_versions").insert({ document_id: docId, content: doc?.content || {}, created_by: profile.id })
    // Update document
    await supabase.from("documents").update({ title, content, updated_by: profile.id, updated_at: new Date().toISOString() }).eq("id", docId)
    toast.success("Document saved")
    setSaving(false)
  }

  const handleSummarize = async () => {
    if (!organization) return
    setSummarizing(true)
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "document", organizationId: organization.id, data: { title, content: JSON.stringify(content) } }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Summary generated!")
    } catch (e: any) { toast.error(e.message) }
    finally { setSummarizing(false) }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-96" /><Skeleton className="h-[600px]" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/documents")}><ArrowLeft className="h-4 w-4" /></Button>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-bold border-none shadow-none h-auto p-0 focus-visible:ring-0 max-w-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSummarize} disabled={summarizing}>
            <Sparkles className="mr-2 h-4 w-4" />{summarizing ? "..." : "AI Summary"}
          </Button>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="sm"><History className="mr-2 h-4 w-4" />History</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Version History</SheetTitle></SheetHeader>
              <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                <div className="space-y-3">
                  {versions.map((v) => (
                    <div key={v.id} className="p-3 rounded-lg border cursor-pointer hover:bg-muted" onClick={() => { setContent(v.content); toast.info("Version restored in editor") }}>
                      <p className="text-sm font-medium">{format(new Date(v.created_at), "MMM d, yyyy h:mm a")}</p>
                      <p className="text-xs text-muted-foreground">Click to restore</p>
                    </div>
                  ))}
                  {versions.length === 0 && <p className="text-sm text-muted-foreground">No previous versions</p>}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
      {doc?.tags && doc.tags.length > 0 && (
        <div className="flex gap-1">{doc.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
      )}
      <div className="border rounded-lg min-h-[600px]">
        <Editor content={content} onChange={setContent} />
      </div>
    </div>
  )
}

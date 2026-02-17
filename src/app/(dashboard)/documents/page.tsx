"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import {
  Plus,
  FileText,
  FolderPlus,
  AlertCircle,
  RefreshCw,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { EmptyState } from "@/components/shared/empty-state"
import { DocumentList } from "@/components/documents/document-list"
import { FolderTree } from "@/components/documents/folder-tree"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Document, Folder } from "@/lib/types"

export default function DocumentsPage() {
  const supabase = useSupabase()
  const { organization, profile, isLoading: orgLoading } = useOrg()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newDocDialog, setNewDocDialog] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    if (!organization) return
    setLoading(true)
    setError(null)
    try {
      const [docsResult, foldersResult] = await Promise.all([
        supabase
          .from("documents")
          .select("*")
          .eq("organization_id", organization.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("folders")
          .select("*")
          .eq("organization_id", organization.id)
          .order("name"),
      ])

      if (docsResult.error) throw docsResult.error
      if (foldersResult.error) throw foldersResult.error

      setDocuments(docsResult.data || [])
      setFolders(foldersResult.data || [])
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load documents"
      setError(message)
      toast.error("Could not load documents. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [organization, supabase])

  useEffect(() => {
    if (!organization) return
    fetchData()
  }, [organization, fetchData])

  const createDocument = async () => {
    if (!organization || !profile || !newDocTitle.trim()) return
    setCreating(true)
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({
          organization_id: organization.id,
          title: newDocTitle.trim(),
          content: {},
          folder_id: selectedFolder,
          created_by: profile.id,
        })
        .select()
        .single()

      if (error) throw error

      setNewDocDialog(false)
      setNewDocTitle("")
      toast.success("Document created")
      if (data) router.push(`/documents/${data.id}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create document"
      toast.error(message)
    } finally {
      setCreating(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !organization || !profile) return

    const ext = file.name.split(".").pop()?.toLowerCase()
    const baseName = file.name.replace(/\.[^/.]+$/, "")

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      })

      let content: any

      if (ext === "txt" || ext === "md") {
        const paragraphs = text.split(/\n/).map((line) => ({
          type: "paragraph" as const,
          content: line ? [{ type: "text" as const, text: line }] : undefined,
        }))
        content = { type: "doc", content: paragraphs }
      } else if (ext === "csv") {
        content = {
          type: "doc",
          content: [
            {
              type: "codeBlock",
              attrs: { language: "csv" },
              content: [{ type: "text", text }],
            },
          ],
        }
      } else if (ext === "json") {
        content = {
          type: "doc",
          content: [
            {
              type: "codeBlock",
              attrs: { language: "json" },
              content: [{ type: "text", text }],
            },
          ],
        }
      } else if (ext === "html") {
        const lines = text.split(/\n/)
        const paragraphs = lines.map((line) => ({
          type: "paragraph" as const,
          content: line ? [{ type: "text" as const, text: line }] : undefined,
        }))
        content = { type: "doc", content: paragraphs }
      } else {
        toast.error("Unsupported file type")
        return
      }

      const { data, error } = await supabase
        .from("documents")
        .insert({
          organization_id: organization.id,
          title: baseName,
          content,
          folder_id: selectedFolder,
          created_by: profile.id,
        })
        .select()
        .single()

      if (error) throw error

      toast.success(`Imported "${file.name}" successfully`)
      if (data) router.push(`/documents/${data.id}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to import file"
      toast.error(message)
    } finally {
      // Reset file input so the same file can be re-imported
      if (importRef.current) importRef.current.value = ""
    }
  }

  const filteredDocs = selectedFolder
    ? documents.filter((d) => d.folder_id === selectedFolder)
    : documents

  // --- Loading states ---
  if (orgLoading || (loading && !error)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72" />
        <div className="flex gap-4">
          <Skeleton className="w-56 h-96" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-destructive/50 bg-destructive/5 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Unable to load documents</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {error}. Check your connection and try again.
        </p>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Create and organize team documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={importRef}
            type="file"
            accept=".txt,.md,.csv,.json,.html"
            className="hidden"
            onChange={handleImport}
          />
          <Button variant="outline" onClick={() => importRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        <Dialog open={newDocDialog} onOpenChange={setNewDocDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-title">Title</Label>
                <Input
                  id="doc-title"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Untitled Document"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newDocTitle.trim()) createDocument()
                  }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  You can rename this later. The document will open in the rich text editor.
                </p>
              </div>
              <Button
                onClick={createDocument}
                className="w-full"
                disabled={!newDocTitle.trim() || creating}
              >
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-4">
        <FolderTree
          folders={folders}
          selectedFolder={selectedFolder}
          onSelect={setSelectedFolder}
          organizationId={organization?.id || ""}
          onRefresh={fetchData}
        />
        {filteredDocs.length === 0 ? (
          <div className="flex-1">
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                {selectedFolder ? "This folder is empty" : "No documents yet"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {selectedFolder
                  ? "Create a new document in this folder or move existing documents here."
                  : "Create your first document to get started."}
              </p>
              <Button onClick={() => setNewDocDialog(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-1">
            <div className="px-1 pb-2">
              <p className="text-sm text-muted-foreground">
                {filteredDocs.length} document
                {filteredDocs.length !== 1 ? "s" : ""}
                {selectedFolder ? " in this folder" : ""}
              </p>
            </div>
            <DocumentList documents={filteredDocs} />
          </div>
        )}
      </div>
    </div>
  )
}

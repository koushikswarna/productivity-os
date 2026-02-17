"use client"
import Link from "next/link"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { Document } from "@/lib/types"

interface DocumentListProps { documents: Document[] }

export function DocumentList({ documents }: DocumentListProps) {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Link key={doc.id} href={`/documents/${doc.id}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{doc.title || "Untitled"}</p>
            <p className="text-xs text-muted-foreground">Updated {format(new Date(doc.updated_at), "MMM d, yyyy")}</p>
          </div>
          <div className="flex gap-1">{doc.tags?.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
        </Link>
      ))}
    </div>
  )
}

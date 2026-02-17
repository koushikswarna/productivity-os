"use client"
import { useState } from "react"
import { ChevronRight, Folder as FolderIcon, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { toast } from "sonner"
import type { Folder } from "@/lib/types"

interface FolderTreeProps { folders: Folder[]; selectedFolder: string | null; onSelect: (id: string | null) => void; organizationId: string; onRefresh: () => void }

export function FolderTree({ folders, selectedFolder, onSelect, organizationId, onRefresh }: FolderTreeProps) {
  const supabase = useSupabase()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const rootFolders = folders.filter((f) => !f.parent_folder_id)

  const createFolder = async () => {
    if (!newName.trim()) return
    await supabase.from("folders").insert({ organization_id: organizationId, name: newName.trim(), parent_folder_id: null })
    setNewName(""); setCreating(false); toast.success("Folder created"); onRefresh()
  }

  return (
    <div className="w-56 border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Folders</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCreating(true)}><FolderPlus className="h-3.5 w-3.5" /></Button>
      </div>
      {creating && (
        <div className="flex gap-1">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Folder name" className="h-7 text-xs" onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setCreating(false) }} autoFocus />
        </div>
      )}
      <button onClick={() => onSelect(null)} className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted", !selectedFolder && "bg-muted font-medium")}>All Documents</button>
      {rootFolders.map((folder) => (
        <button key={folder.id} onClick={() => onSelect(folder.id)}
          className={cn("w-full flex items-center gap-2 text-sm px-2 py-1.5 rounded hover:bg-muted text-left", selectedFolder === folder.id && "bg-muted font-medium")}>
          <FolderIcon className="h-3.5 w-3.5 text-muted-foreground" />{folder.name}
        </button>
      ))}
    </div>
  )
}

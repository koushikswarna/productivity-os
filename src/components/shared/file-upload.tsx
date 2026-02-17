"use client"
import { useCallback, useState } from "react"
import { Upload, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { toast } from "sonner"

interface FileUploadProps {
  bucket: string
  path: string
  onUpload: (url: string) => void
  accept?: string
  maxSize?: number // in MB
}

export function FileUpload({ bucket, path, onUpload, accept, maxSize = 10 }: FileUploadProps) {
  const supabase = useSupabase()
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }
    setUploading(true)
    setFileName(file.name)
    const filePath = `${path}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(bucket).upload(filePath, file)
    if (error) {
      toast.error("Upload failed: " + error.message)
      setFileName(null)
    } else {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
      onUpload(publicUrl)
      toast.success("File uploaded successfully")
    }
    setUploading(false)
  }, [bucket, path, maxSize, onUpload, supabase])

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" disabled={uploading} asChild>
        <label className="cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" className="hidden" accept={accept} onChange={handleUpload} />
        </label>
      </Button>
      {fileName && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <File className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{fileName}</span>
          <button onClick={() => setFileName(null)}><X className="h-3 w-3" /></button>
        </div>
      )}
    </div>
  )
}

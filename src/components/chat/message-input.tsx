"use client"
import { useState, useRef } from "react"
import { Send, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"

interface MessageInputProps { onSend: (content: string) => Promise<void> }

const QUICK_EMOJIS = ["😊", "👍", "❤️", "🎉", "🔥", "💯", "😂", "🤔", "👀", "✅", "🚀", "💪"]

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    if (!content.trim() || sending) return
    setSending(true)
    await onSend(content.trim())
    setContent("")
    setSending(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await onSend(`📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
    toast.success(`File "${file.name}" shared`)
    if (fileRef.current) fileRef.current.value = ""
  }

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  return (
    <div className="p-3 border-t">
      <div className="flex items-end gap-2">
        <input type="file" ref={fileRef} className="hidden" onChange={handleFileSelect} />
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-4 w-4" />
        </Button>
        <Textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Type a message..." className="min-h-[40px] max-h-[120px] resize-none" rows={1} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0"><Smile className="h-4 w-4" /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="end">
            <div className="grid grid-cols-6 gap-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => insertEmoji(emoji)}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button size="icon" className="shrink-0" onClick={handleSend} disabled={!content.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 ml-10">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}

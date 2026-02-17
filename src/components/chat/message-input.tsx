"use client"
import { useState, useRef } from "react"
import { Send, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface MessageInputProps { onSend: (content: string) => Promise<void> }

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div className="p-3 border-t">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="shrink-0"><Paperclip className="h-4 w-4" /></Button>
        <Textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Type a message..." className="min-h-[40px] max-h-[120px] resize-none" rows={1} />
        <Button variant="ghost" size="icon" className="shrink-0"><Smile className="h-4 w-4" /></Button>
        <Button size="icon" className="shrink-0" onClick={handleSend} disabled={!content.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

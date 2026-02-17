"use client"
import { useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageItem } from "./message-item"
import type { MessageWithUser } from "@/lib/types"

interface MessageListProps { messages: MessageWithUser[]; isLoading: boolean }

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-64" /></div></div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground">No messages yet. Start the conversation!</div>
      )}
      {messages.map((msg, i) => {
        const showAvatar = i === 0 || messages[i - 1]?.user_id !== msg.user_id
        return <MessageItem key={msg.id} message={msg} showAvatar={showAvatar} />
      })}
      <div ref={bottomRef} />
    </div>
  )
}

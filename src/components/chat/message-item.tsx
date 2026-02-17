"use client"
import { format } from "date-fns"
import { UserAvatar } from "@/components/shared/user-avatar"
import { cn } from "@/lib/utils"
import type { MessageWithUser } from "@/lib/types"

interface MessageItemProps { message: MessageWithUser; showAvatar: boolean }

export function MessageItem({ message, showAvatar }: MessageItemProps) {
  return (
    <div className={cn("flex gap-3 px-2 py-0.5 hover:bg-muted/50 rounded group", showAvatar && "mt-3")}>
      <div className="w-8 shrink-0">
        {showAvatar && <UserAvatar name={message.user?.full_name || ""} avatarUrl={message.user?.avatar_url} size="sm" />}
      </div>
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{message.user?.full_name || "Unknown"}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(message.created_at), "h:mm a")}</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5">{r.emoji}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

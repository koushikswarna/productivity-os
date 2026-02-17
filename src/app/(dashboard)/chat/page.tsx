"use client"

import { ChannelList } from "@/components/chat/channel-list"
import { MessageSquare } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <ChannelList />
      <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed">
        <div className="text-center p-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-semibold">Welcome to Team Chat</h3>
          <p className="mt-2 text-muted-foreground">
            Select a channel or start a conversation
          </p>
        </div>
      </div>
    </div>
  )
}

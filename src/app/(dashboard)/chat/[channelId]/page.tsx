"use client"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import { ChannelList } from "@/components/chat/channel-list"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { ChatHeader } from "@/components/chat/chat-header"
import { useChatStore } from "@/lib/stores/chat-store"
import { useRealtimeMessages } from "@/lib/hooks/use-realtime-messages"

export default function ChannelPage() {
  const params = useParams()
  const channelId = params.channelId as string
  const setActiveChannelId = useChatStore((s) => s.setActiveChannelId)
  const { messages, isLoading, sendMessage } = useRealtimeMessages(channelId)

  useEffect(() => {
    setActiveChannelId(channelId)
    return () => setActiveChannelId(null)
  }, [channelId, setActiveChannelId])

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <ChannelList />
      <div className="flex-1 flex flex-col rounded-lg border">
        <ChatHeader channelId={channelId} />
        <MessageList messages={messages} isLoading={isLoading} />
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  )
}

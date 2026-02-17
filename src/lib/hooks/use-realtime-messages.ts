'use client'
import { useEffect, useCallback, useState } from 'react'
import { useSupabase } from './use-supabase'
import type { MessageWithUser } from '@/lib/types'

export function useRealtimeMessages(channelId: string | null) {
  const supabase = useSupabase()
  const [messages, setMessages] = useState<MessageWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial messages
  useEffect(() => {
    if (!channelId) return
    setIsLoading(true)

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*, user:profiles!user_id(*), reactions(*)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100)

      setMessages((data as unknown as MessageWithUser[]) || [])
      setIsLoading(false)
    }

    fetchMessages()
  }, [channelId, supabase])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!channelId) return

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          // Fetch the full message with user profile
          const { data } = await supabase
            .from('messages')
            .select('*, user:profiles!user_id(*), reactions(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data as unknown as MessageWithUser])
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, user:profiles!user_id(*), reactions(*)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) =>
              prev.map((m) => (m.id === data.id ? (data as unknown as MessageWithUser) : m))
            )
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, supabase])

  const sendMessage = useCallback(async (content: string, parentMessageId?: string) => {
    if (!channelId) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('messages').insert({
      channel_id: channelId,
      user_id: user.id,
      content,
      parent_message_id: parentMessageId || null,
    })
  }, [channelId, supabase])

  return { messages, isLoading, sendMessage }
}

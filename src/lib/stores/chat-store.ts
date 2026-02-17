import { create } from 'zustand'

interface ChatState {
  activeChannelId: string | null
  setActiveChannelId: (id: string | null) => void
  typingUsers: Record<string, string[]> // channelId -> userIds
  setTypingUsers: (channelId: string, users: string[]) => void
  unreadCounts: Record<string, number>
  setUnreadCount: (channelId: string, count: number) => void
  incrementUnread: (channelId: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChannelId: null,
  setActiveChannelId: (id) => set({ activeChannelId: id }),
  typingUsers: {},
  setTypingUsers: (channelId, users) =>
    set((state) => ({ typingUsers: { ...state.typingUsers, [channelId]: users } })),
  unreadCounts: {},
  setUnreadCount: (channelId, count) =>
    set((state) => ({ unreadCounts: { ...state.unreadCounts, [channelId]: count } })),
  incrementUnread: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: (state.unreadCounts[channelId] || 0) + 1,
      },
    })),
}))

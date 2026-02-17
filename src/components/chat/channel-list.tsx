"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, Hash, Lock, User, MessageCircle, Users, Search, UserPlus, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { useChatStore } from "@/lib/stores/chat-store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Channel, Profile } from "@/lib/types"

export function ChannelList() {
  const supabase = useSupabase()
  const { organization, profile } = useOrg()
  const router = useRouter()
  const params = useParams()
  const activeId = params?.channelId as string
  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const [channels, setChannels] = useState<Channel[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dmDialogOpen, setDmDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"public" | "private">("public")
  const [members, setMembers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingDM, setLoadingDM] = useState<string | null>(null)

  useEffect(() => {
    if (!organization) return
    const fetchData = async () => {
      const { data } = await supabase
        .from("channels")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at")
      setChannels(data || [])
    }
    fetchData()
  }, [organization, supabase])

  useEffect(() => {
    if (!organization) return
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("organization_members")
        .select("user:profiles!user_id(*)")
        .eq("organization_id", organization.id)
      setMembers(
        data?.map((d: any) => d.user).filter(Boolean).filter((u: Profile) => u.id !== profile?.id) || []
      )
    }
    fetchMembers()
  }, [organization, supabase, profile?.id])

  const createChannel = async () => {
    if (!organization || !profile || !newName.trim()) return
    try {
      const { data, error } = await supabase.from("channels").insert({
        organization_id: organization.id, name: newName.trim(), type: newType, created_by: profile.id,
      }).select().single()
      if (error) throw error
      if (data) {
        await supabase.from("channel_members").insert({ channel_id: data.id, user_id: profile.id })
        setChannels((prev) => [...prev, data])
        setDialogOpen(false)
        setNewName("")
        router.push(`/chat/${data.id}`)
        toast.success("Channel created")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create channel")
    }
  }

  const startDirectMessage = async (otherUser: Profile) => {
    if (!organization || !profile) return
    setLoadingDM(otherUser.id)
    try {
      // Check if a DM channel already exists between these two users
      const existingDMs = channels.filter((ch) => ch.type === "direct")
      for (const dm of existingDMs) {
        const { data: members } = await supabase
          .from("channel_members")
          .select("user_id")
          .eq("channel_id", dm.id)
        if (members && members.length === 2) {
          const memberIds = members.map((m) => m.user_id)
          if (memberIds.includes(profile.id) && memberIds.includes(otherUser.id)) {
            setDmDialogOpen(false)
            setSearchQuery("")
            router.push(`/chat/${dm.id}`)
            setLoadingDM(null)
            return
          }
        }
      }

      // Create a new DM channel
      const { data: newChannel, error } = await supabase.from("channels").insert({
        organization_id: organization.id,
        name: `dm-${profile.id.slice(0, 8)}-${otherUser.id.slice(0, 8)}`,
        type: "direct",
        created_by: profile.id,
      }).select().single()
      if (error) throw error

      if (newChannel) {
        // Add both users as members
        await supabase.from("channel_members").insert([
          { channel_id: newChannel.id, user_id: profile.id },
          { channel_id: newChannel.id, user_id: otherUser.id },
        ])
        setChannels((prev) => [...prev, newChannel])
        setDmDialogOpen(false)
        setSearchQuery("")
        router.push(`/chat/${newChannel.id}`)
        toast.success(`Started conversation with ${otherUser.full_name}`)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start conversation")
    }
    setLoadingDM(null)
  }

  const startSelfChat = async () => {
    if (!organization || !profile) return
    // Check if self-chat channel already exists
    const selfChannel = channels.find(
      (ch) => ch.type === "direct" && ch.name === `self-notes-${profile.id.slice(0, 8)}`
    )
    if (selfChannel) {
      router.push(`/chat/${selfChannel.id}`)
      return
    }
    try {
      const { data: newChannel, error } = await supabase.from("channels").insert({
        organization_id: organization.id,
        name: `self-notes-${profile.id.slice(0, 8)}`,
        description: "Notes to Self",
        type: "direct",
        created_by: profile.id,
      }).select().single()
      if (error) throw error
      if (newChannel) {
        await supabase.from("channel_members").insert({ channel_id: newChannel.id, user_id: profile.id })
        setChannels((prev) => [...prev, newChannel])
        router.push(`/chat/${newChannel.id}`)
        toast.success("Notes to Self created")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create self-chat")
    }
  }

  // Separate channels and DMs
  const orgChannels = channels.filter((ch) => ch.type !== "direct")
  const dmChannels = channels.filter((ch) => ch.type === "direct")

  const filteredMembers = searchQuery
    ? members.filter((m) =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members

  const iconMap = { public: Hash, private: Lock, direct: MessageCircle }

  return (
    <div className="w-64 border rounded-lg flex flex-col">
      {/* Channels Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Channels</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
              <DialogDescription>
                Create a new channel for your team to communicate in.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. marketing, engineering" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public — Anyone in the org can join</SelectItem>
                    <SelectItem value="private">Private — Invite only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createChannel} className="w-full" disabled={!newName.trim()}>Create Channel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Organization Channels */}
          {orgChannels.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-4 text-center">
              No channels yet. Create one to start chatting!
            </p>
          ) : (
            <div className="space-y-0.5">
              {orgChannels.map((ch) => {
                const Icon = iconMap[ch.type as keyof typeof iconMap] || Hash
                const unread = unreadCounts[ch.id] || 0
                return (
                  <button key={ch.id} onClick={() => router.push(`/chat/${ch.id}`)}
                    className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors",
                      activeId === ch.id && "bg-muted font-medium")}>
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1 text-left">{ch.name}</span>
                    {unread > 0 && <Badge variant="destructive" className="h-5 min-w-[20px] px-1 text-[10px]">{unread}</Badge>}
                  </button>
                )
              })}
            </div>
          )}

          <Separator className="my-3" />

          {/* Direct Messages */}
          <div className="flex items-center justify-between px-2 mb-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</h4>
            <Dialog open={dmDialogOpen} onOpenChange={setDmDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <UserPlus className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Direct Message</DialogTitle>
                  <DialogDescription>
                    Start a private conversation with a team member.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1">
                      {filteredMembers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {searchQuery ? "No members found" : "No other members in this organization"}
                        </p>
                      ) : (
                        filteredMembers.map((member) => (
                          <button
                            key={member.id}
                            onClick={() => startDirectMessage(member)}
                            disabled={loadingDM === member.id}
                            className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                          >
                            <UserAvatar name={member.full_name || ""} avatarUrl={member.avatar_url} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{member.full_name}</p>
                            </div>
                            {loadingDM === member.id ? (
                              <span className="text-xs text-muted-foreground">Opening...</span>
                            ) : (
                              <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Notes to Self */}
          <button
            onClick={startSelfChat}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
          >
            <StickyNote className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1 text-left">Notes to Self</span>
          </button>

          <div className="space-y-0.5">
            {dmChannels.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-2 text-center">
                No conversations yet
              </p>
            ) : (
              dmChannels.map((ch) => {
                const unread = unreadCounts[ch.id] || 0
                return (
                  <button key={ch.id} onClick={() => router.push(`/chat/${ch.id}`)}
                    className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors",
                      activeId === ch.id && "bg-muted font-medium")}>
                    <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1 text-left">
                      {ch.description || ch.name.replace(/^dm-/, "")}
                    </span>
                    {unread > 0 && <Badge variant="destructive" className="h-5 min-w-[20px] px-1 text-[10px]">{unread}</Badge>}
                  </button>
                )
              })
            )}
          </div>

          <Separator className="my-3" />

          {/* Team Members Quick View */}
          <div className="px-2 mb-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Team Members</h4>
          </div>
          <div className="space-y-0.5 px-1">
            {members.slice(0, 5).map((member) => (
              <button
                key={member.id}
                onClick={() => startDirectMessage(member)}
                className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-sm hover:bg-muted transition-colors"
              >
                <div className="relative">
                  <UserAvatar name={member.full_name || ""} avatarUrl={member.avatar_url} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <span className="truncate text-left text-xs">{member.full_name}</span>
              </button>
            ))}
            {members.length > 5 && (
              <button
                onClick={() => setDmDialogOpen(true)}
                className="w-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                +{members.length - 5} more members
              </button>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

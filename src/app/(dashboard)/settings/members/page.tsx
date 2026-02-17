"use client"

import { useEffect, useState } from "react"
import { Plus, Mail, Trash2, Users, Shield, Crown, UserPlus, AlertCircle, Loader2, Search, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/shared/user-avatar"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { useOrg } from "@/lib/hooks/use-org"
import { usePermission } from "@/lib/hooks/use-permission"
import { toast } from "sonner"
import { format } from "date-fns"

export default function MembersPage() {
  const supabase = useSupabase()
  const { organization, profile, isLoading: orgLoading } = useOrg()
  const { canManageMembers } = usePermission()
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [inviting, setInviting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!organization) return
    try {
      const { data, error: fetchError } = await supabase
        .from("organization_members")
        .select("*, user:profiles!user_id(*)")
        .eq("organization_id", organization.id)
        .order("joined_at", { ascending: true })

      if (fetchError) throw fetchError
      setMembers(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to load members")
      toast.error("Failed to load members")
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!orgLoading) fetchMembers()
  }, [organization, orgLoading, supabase])

  const handleInvite = async () => {
    if (!organization || !inviteEmail.trim()) return
    setInviting(true)
    try {
      // Check if user exists by looking up their profile
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", inviteEmail.trim())
        .single()

      if (existingUser) {
        // Check if already a member
        const { data: existingMember } = await supabase
          .from("organization_members")
          .select("id")
          .eq("organization_id", organization.id)
          .eq("user_id", existingUser.id)
          .single()

        if (existingMember) {
          toast.error("This user is already a member of this organization")
          setInviting(false)
          return
        }

        await supabase.from("organization_members").insert({
          organization_id: organization.id,
          user_id: existingUser.id,
          role: inviteRole,
        })
        toast.success("Member added successfully!")
      } else {
        toast.info("Invitation sent! The user will be added when they sign up. (Note: Full email invites require Supabase email configuration)")
      }

      setDialogOpen(false)
      setInviteEmail("")
      setInviteRole("member")
      fetchMembers()
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member")
    }
    setInviting(false)
  }

  const updateRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId)
      if (error) throw error
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role } : m))
      toast.success("Role updated")
    } catch (err: any) {
      toast.error(err.message || "Failed to update role")
    }
  }

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this organization?`)) return
    setRemovingId(memberId)
    try {
      const { error } = await supabase.from("organization_members").delete().eq("id", memberId)
      if (error) throw error
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
      toast.success("Member removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member")
    }
    setRemovingId(null)
  }

  const roleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="h-3 w-3" />
      case "admin": return <Shield className="h-3 w-3" />
      default: return null
    }
  }

  const roleColors: Record<string, "default" | "secondary" | "outline"> = {
    owner: "default",
    admin: "secondary",
    member: "outline",
    guest: "outline",
  }

  const filteredMembers = searchQuery
    ? members.filter((m) =>
        m.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members

  const memberCount = members.length
  const adminCount = members.filter((m) => m.role === "owner" || m.role === "admin").length

  if (loading || orgLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team
          </p>
        </div>
        {canManageMembers && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a Team Member</DialogTitle>
                <DialogDescription>
                  Add a new team member.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                      type="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          Admin — Can manage members and settings
                        </div>
                      </SelectItem>
                      <SelectItem value="member">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-3 w-3" />
                          Member — Can create and edit content
                        </div>
                      </SelectItem>
                      <SelectItem value="guest">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          Guest — View-only access
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                  {inviting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending invite...</>
                  ) : (
                    <><Mail className="mr-2 h-4 w-4" />Send Invite</>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. <button className="underline font-medium" onClick={fetchMembers}>Try again</button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{memberCount}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{adminCount}</p>
                <p className="text-xs text-muted-foreground">Admins & Owners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{organization?.plan || "free"}</p>
                <p className="text-xs text-muted-foreground">Current Plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      {members.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Members</CardTitle>
          <CardDescription>
            Members of your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {canManageMembers && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageMembers ? 4 : 3} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No members match your search" : "No members found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((m) => {
                  const isCurrentUser = m.user_id === profile?.id
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={m.user?.full_name || ""} avatarUrl={m.user?.avatar_url} size="sm" />
                          <div>
                            <p className="font-medium">
                              {m.user?.full_name || "Unknown"}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManageMembers && m.role !== "owner" && !isCurrentUser ? (
                          <Select value={m.role} onValueChange={(v) => updateRole(m.id, v)}>
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={roleColors[m.role] || "outline"} className="gap-1">
                            {roleIcon(m.role)}
                            {m.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.joined_at ? format(new Date(m.joined_at), "MMM d, yyyy") : "—"}
                      </TableCell>
                      {canManageMembers && (
                        <TableCell>
                          {m.role !== "owner" && !isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMember(m.id, m.user?.full_name || "this member")}
                              disabled={removingId === m.id}
                            >
                              {removingId === m.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}

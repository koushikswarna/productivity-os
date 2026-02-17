"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  Building2,
  CreditCard,
  Users,
  ChevronRight,
  AlertTriangle,
  LogOut,
  Trash2,
  Loader2,
  Camera,
  Shield,
} from "lucide-react"
import { useOrg } from "@/lib/hooks/use-org"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { toast } from "sonner"

export default function SettingsPage() {
  const { profile, organization, membership, isLoading: orgLoading } = useOrg()
  const supabase = useSupabase()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [orgName, setOrgName] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingOrg, setSavingOrg] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(true)
  const [deletingOrg, setDeletingOrg] = useState(false)
  const [leavingOrg, setLeavingOrg] = useState(false)

  // Populate form fields when profile / org loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
    }
  }, [profile])

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || "")
    }
  }, [organization])

  // Fetch the authenticated user's email from Supabase Auth
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) throw error
        setEmail(user?.email || "")
      } catch {
        setEmail("")
      } finally {
        setLoadingEmail(false)
      }
    }
    fetchEmail()
  }, [supabase])

  // ---------------------------------------------------------------
  // Save handlers with try/catch
  // ---------------------------------------------------------------
  const saveProfile = async () => {
    if (!profile) return
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.")
      return
    }

    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() })
        .eq("id", profile.id)

      if (error) throw error
      toast.success("Profile updated successfully.")
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile. Please try again.")
    } finally {
      setSavingProfile(false)
    }
  }

  const saveOrg = async () => {
    if (!organization) return
    if (!orgName.trim()) {
      toast.error("Organization name cannot be empty.")
      return
    }

    setSavingOrg(true)
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ name: orgName.trim() })
        .eq("id", organization.id)

      if (error) throw error
      toast.success("Organization updated successfully.")
    } catch (e: any) {
      toast.error(
        e?.message || "Failed to update organization. Please try again."
      )
    } finally {
      setSavingOrg(false)
    }
  }

  const handleDeleteOrg = async () => {
    if (!organization) return
    setDeletingOrg(true)
    try {
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", organization.id)

      if (error) throw error
      toast.success("Organization deleted.")
      // The org provider should handle the redirect
    } catch (e: any) {
      toast.error(
        e?.message || "Failed to delete organization. Please try again."
      )
    } finally {
      setDeletingOrg(false)
    }
  }

  const handleLeaveOrg = async () => {
    if (!organization || !membership) return
    setLeavingOrg(true)
    try {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", membership.id)

      if (error) throw error
      toast.success("You have left the organization.")
    } catch (e: any) {
      toast.error(
        e?.message || "Failed to leave organization. Please try again."
      )
    } finally {
      setLeavingOrg(false)
    }
  }

  // ---------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------
  if (orgLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-56 rounded-lg" />
      </div>
    )
  }

  const isOwner = membership?.role === "owner"

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and organization
        </p>
      </div>

      {/* ============================================================
          Profile Card
          ============================================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-7 w-7" />
              )}
              <div className="absolute -bottom-1 -right-1 rounded-full bg-muted p-1">
                <Camera className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {loadingEmail ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                id="email"
                value={email}
                disabled
                className="text-muted-foreground"
              />
            )}
          </div>

          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* ============================================================
          Organization Card
          ============================================================ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Manage your workspace settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter organization name"
            />
          </div>

          <div className="space-y-2">
            <Label>Current Plan</Label>
            <Input
              value={organization?.plan || "free"}
              disabled
              className="capitalize"
            />
          </div>

          {membership && (
            <div className="space-y-2">
              <Label>Your Role</Label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize text-muted-foreground">
                  {membership.role}
                </span>
              </div>
            </div>
          )}

          <Button onClick={saveOrg} disabled={savingOrg}>
            {savingOrg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {savingOrg ? "Saving..." : "Save Organization"}
          </Button>
        </CardContent>
      </Card>

      {/* ============================================================
          Quick Links
          ============================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">More Settings</CardTitle>
          <CardDescription>
            Manage members, billing, and other organization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Link
            href="/settings/members"
            className="flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Members</div>
                <div className="text-xs text-muted-foreground">
                  Invite people, manage roles and permissions
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="/settings/billing"
            className="flex items-center justify-between rounded-md border px-4 py-3 text-sm transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Billing</div>
                <div className="text-xs text-muted-foreground">
                  Manage your subscription, invoices, and payment methods
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {/* ============================================================
          Danger Zone
          ============================================================ */}
      <Card className="border-destructive/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Leave organization (non-owners) */}
          {!isOwner && (
            <div className="flex items-center justify-between rounded-md border border-destructive/30 p-4">
              <div>
                <p className="text-sm font-medium">Leave organization</p>
                <p className="text-xs text-muted-foreground">
                  Remove yourself from{" "}
                  <strong>{organization?.name || "this organization"}</strong>.
                  You will lose access to all its data.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/40 hover:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Leave organization?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be removed from{" "}
                      <strong>
                        {organization?.name || "this organization"}
                      </strong>
                      . To rejoin you will need a new invitation. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLeaveOrg}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={leavingOrg}
                    >
                      {leavingOrg ? "Leaving..." : "Leave organization"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Delete organization (owners only) */}
          {isOwner && (
            <div className="flex items-center justify-between rounded-md border border-destructive/30 p-4">
              <div>
                <p className="text-sm font-medium">Delete organization</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete{" "}
                  <strong>{organization?.name || "this organization"}</strong>{" "}
                  and all of its data, including projects, tasks, and documents.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete organization permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete{" "}
                      <strong>
                        {organization?.name || "this organization"}
                      </strong>
                      , including all projects, tasks, documents, messages, and
                      member data. This action is irreversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteOrg}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deletingOrg}
                    >
                      {deletingOrg
                        ? "Deleting..."
                        : "Yes, delete organization"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

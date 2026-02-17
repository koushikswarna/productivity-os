"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building, Users, Sparkles, ArrowRight, Check, Loader2, UserPlus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSupabase } from "@/lib/hooks/use-supabase"
import { toast } from "sonner"

type OnboardingMode = "choose" | "create" | "join"

export default function OnboardingPage() {
  const supabase = useSupabase()
  const router = useRouter()
  const [mode, setMode] = useState<OnboardingMode>("choose")
  const [step, setStep] = useState(0)
  const [orgName, setOrgName] = useState("")
  const [orgSlug, setOrgSlug] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [inviteEmails, setInviteEmails] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrg = async () => {
    if (!orgName.trim()) { toast.error("Organization name is required"); return }
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Not authenticated"); setLoading(false); return }

      const slug = orgSlug || orgName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")

      // Create org
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: orgName.trim(), slug })
        .select()
        .single()
      if (orgError) throw orgError

      // Add user as owner
      await supabase.from("organization_members").insert({
        organization_id: org.id, user_id: user.id, role: "owner"
      })

      // Set as current org
      await supabase.from("profiles").update({
        current_organization_id: org.id
      }).eq("id", user.id)

      // --- SEED SAMPLE DATA ---

      // Create default channels
      await supabase.from("channels").insert([
        { organization_id: org.id, name: "general", description: "General discussion for the whole team", type: "public", created_by: user.id },
        { organization_id: org.id, name: "random", description: "Water cooler chat, memes, and fun stuff", type: "public", created_by: user.id },
      ])

      // Add user to channels
      const { data: channels } = await supabase.from("channels").select("id").eq("organization_id", org.id)
      if (channels) {
        await supabase.from("channel_members").insert(
          channels.map((ch) => ({ channel_id: ch.id, user_id: user.id }))
        )
      }

      // Create a sample project
      const { data: project } = await supabase
        .from("projects")
        .insert({
          organization_id: org.id,
          name: "Getting Started",
          description: "Your first project! Use this to learn how ProductivityOS works. Feel free to edit or delete these sample tasks.",
          color: "#6366f1",
          created_by: user.id,
        })
        .select()
        .single()

      if (project) {
        await supabase.from("project_members").insert({
          project_id: project.id, user_id: user.id, role: "owner",
        })

        await supabase.from("tasks").insert([
          {
            project_id: project.id, organization_id: org.id,
            title: "Explore the Kanban board",
            description: "Try dragging this task to 'In Progress'! You can drag tasks between columns to update their status.",
            status: "todo", priority: "high", reporter_id: user.id, assignee_id: user.id, position: 1000, labels: ["tutorial"],
          },
          {
            project_id: project.id, organization_id: org.id,
            title: "Create your first task",
            description: "Click the 'Add Task' button above to create a new task. You can set priority, assignee, due date, and more.",
            status: "todo", priority: "medium", reporter_id: user.id, position: 2000, labels: ["tutorial"],
          },
          {
            project_id: project.id, organization_id: org.id,
            title: "Try the AI Priority Analysis",
            description: "Click the 'AI Priorities' button to get AI-powered suggestions on which tasks to focus on.",
            status: "todo", priority: "low", reporter_id: user.id, position: 3000, labels: ["tutorial", "ai"],
          },
          {
            project_id: project.id, organization_id: org.id,
            title: "Invite your team members",
            description: "Go to Settings > Members to invite people to your organization.",
            status: "in_progress", priority: "medium", reporter_id: user.id, assignee_id: user.id, position: 1000, labels: ["setup"],
          },
          {
            project_id: project.id, organization_id: org.id,
            title: "Set up team chat channels",
            description: "We've created #general and #random for you. Go to Chat to create more channels for your team.",
            status: "done", priority: "medium", reporter_id: user.id, assignee_id: user.id, position: 1000, labels: ["setup"],
          },
        ])
      }

      // Create a sample document
      await supabase.from("documents").insert({
        organization_id: org.id,
        title: "Welcome to ProductivityOS",
        content: {
          type: "doc",
          content: [
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Welcome to ProductivityOS!" }] },
            { type: "paragraph", content: [{ type: "text", text: "This is your team's document editor. You can create rich documents with headings, lists, code blocks, images, and more." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Quick Start Guide" }] },
            { type: "bulletList", content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Projects" }, { type: "text", text: " — Create projects and manage tasks with a Kanban board" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Chat" }, { type: "text", text: " — Real-time messaging with your team in channels" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Documents" }, { type: "text", text: " — Create and collaborate on documents (like this one!)" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Reports" }, { type: "text", text: " — View charts and generate AI-powered reports" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Analytics" }, { type: "text", text: " — Track KPIs and get AI insights" }] }] },
            ]},
          ],
        },
        created_by: user.id,
        tags: ["getting-started", "guide"],
      })

      // Create a welcome message in general channel
      if (channels && channels.length > 0) {
        await supabase.from("messages").insert({
          channel_id: channels[0].id,
          user_id: user.id,
          content: "Welcome to ProductivityOS! This is the #general channel. Your team's conversations will appear here.",
        })
      }

      toast.success("Workspace created with sample data!")
      setLoading(false)
      setStep(1)
    } catch (err: any) {
      setError(err.message || "Failed to create workspace")
      toast.error(err.message || "Failed to create workspace")
      setLoading(false)
    }
  }

  const joinOrg = async () => {
    if (!joinCode.trim()) { toast.error("Please enter an organization name or invite code"); return }
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Not authenticated"); setLoading(false); return }

      // Try to find org by slug or name
      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .or(`slug.eq.${joinCode.trim().toLowerCase()},name.ilike.%${joinCode.trim()}%`)
        .limit(1)
        .single()

      if (!org) {
        setError("Organization not found. Ask your admin for the correct organization name or slug.")
        setLoading(false)
        return
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", org.id)
        .eq("user_id", user.id)
        .single()

      if (existingMember) {
        toast.info("You're already a member of this organization!")
        await supabase.from("profiles").update({ current_organization_id: org.id }).eq("id", user.id)
        router.push("/dashboard")
        return
      }

      // Join as member
      const { error: joinError } = await supabase.from("organization_members").insert({
        organization_id: org.id,
        user_id: user.id,
        role: "member",
      })
      if (joinError) throw joinError

      // Set as current org
      await supabase.from("profiles").update({ current_organization_id: org.id }).eq("id", user.id)

      // Add user to all public channels
      const { data: publicChannels } = await supabase
        .from("channels")
        .select("id")
        .eq("organization_id", org.id)
        .eq("type", "public")

      if (publicChannels && publicChannels.length > 0) {
        await supabase.from("channel_members").insert(
          publicChannels.map((ch) => ({ channel_id: ch.id, user_id: user.id }))
        )
      }

      toast.success(`Joined "${org.name}" successfully!`)
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to join organization")
      toast.error(err.message || "Failed to join organization")
    }
    setLoading(false)
  }

  const handleInvite = () => {
    if (inviteEmails.trim()) {
      toast.info("Team invitations would be sent here (requires email configuration)")
    }
    setStep(2)
  }

  const finish = () => {
    router.push("/dashboard")
    router.refresh()
  }

  // ---- CHOOSE MODE ----
  if (mode === "choose") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Welcome to ProductivityOS</h1>
            <p className="text-muted-foreground">
              How would you like to get started?
            </p>
          </div>

          <div className="grid gap-4">
            <Card
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setMode("create")}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Create a new organization</h3>
                  <p className="text-sm text-muted-foreground">
                    You're a team lead or manager starting a new workspace for your team
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setMode("join")}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Join an existing organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Your team already uses ProductivityOS and you want to join them
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ---- JOIN MODE ----
  if (mode === "join") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <div className="w-full max-w-lg">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Join Your Team</CardTitle>
              <CardDescription>
                Enter your organization's name or slug to join. Ask your team admin if you're unsure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label>Organization Name or Slug</Label>
                <Input
                  placeholder="e.g. acme-inc or Acme Inc"
                  value={joinCode}
                  onChange={(e) => { setJoinCode(e.target.value); setError(null) }}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Your admin can find the organization slug in Settings
                </p>
              </div>
              <Button className="w-full" onClick={joinOrg} disabled={loading || !joinCode.trim()}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Looking for organization...</>
                ) : (
                  <>Join Organization <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { setMode("choose"); setError(null) }}>
                <ArrowLeft className="mr-2 h-4 w-4" />Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ---- CREATE MODE ----
  const createSteps = [
    { icon: Building, title: "Create Your Workspace", description: "Set up your organization to get started" },
    { icon: Users, title: "Invite Your Team", description: "Add team members (you can skip this)" },
    { icon: Sparkles, title: "You're All Set!", description: "We've set up some samples to get you started" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {createSteps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < createSteps.length - 1 && (
                <div className={`w-12 h-0.5 transition-colors ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader className="text-center">
            {(() => {
              const Icon = createSteps[step].icon
              return (
                <div className="flex justify-center mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              )
            })()}
            <CardTitle className="text-xl">{createSteps[step].title}</CardTitle>
            <CardDescription>{createSteps[step].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <div className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    placeholder="e.g. Acme Inc, My Startup, Marketing Team"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value)
                      setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
                      setError(null)
                    }}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input
                    placeholder="acme-inc"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your workspace identifier. Share it with team members so they can join.
                  </p>
                </div>
                <Button className="w-full" onClick={createOrg} disabled={loading || !orgName.trim()}>
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up your workspace...</>
                  ) : (
                    <>Create Workspace <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { setMode("choose"); setError(null) }}>
                  <ArrowLeft className="mr-2 h-4 w-4" />Back
                </Button>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Invite by Email</Label>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple emails with commas. You can also invite people later from Settings &gt; Members.
                  </p>
                </div>
                <Button className="w-full" onClick={handleInvite}>
                  {inviteEmails.trim() ? "Send Invites" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(2)}>
                  Skip for now
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Your workspace is ready!</p>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve created some sample data to help you get started:
                  </p>
                </div>
                <div className="text-left space-y-2 bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>A <strong>&quot;Getting Started&quot;</strong> project with sample tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span><strong>#general</strong> and <strong>#random</strong> chat channels</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>A <strong>Welcome Guide</strong> document</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={finish}>
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

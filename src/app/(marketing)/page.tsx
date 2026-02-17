import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  FolderKanban,
  MessageSquare,
  FileText,
  BarChart3,
  TrendingUp,
  Zap,
  Brain,
  FileBarChart,
  ListChecks,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: FolderKanban,
    title: "Task Management",
    description: "Kanban boards, sprints, and deadlines — all with drag-and-drop simplicity.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: MessageSquare,
    title: "Team Chat",
    description: "Real-time channels, threads, and file sharing without leaving your workspace.",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    icon: FileText,
    title: "Documents",
    description: "A collaborative editor with version history, templates, and rich formatting.",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description: "Customizable dashboards with drag-and-drop widgets and live data.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: TrendingUp,
    title: "Analytics",
    description: "Track KPIs, set targets, and monitor trends across every project.",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Smart summaries, priority suggestions, and automated reports powered by AI.",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
]

const aiFeatures = [
  {
    icon: Brain,
    title: "Smart Summaries",
    description: "Instantly summarize any chat thread, document, or project into clear takeaways.",
  },
  {
    icon: ListChecks,
    title: "Priority Analysis",
    description: "AI identifies bottlenecks and suggests what your team should focus on next.",
  },
  {
    icon: FileBarChart,
    title: "Auto Reports",
    description: "Generate polished status reports and dashboards in seconds, not hours.",
  },
]

const trustedBy = ["Vercel", "Linear", "Notion", "Stripe", "Figma"]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="relative py-24 md:py-36 lg:py-44">
        {/* Decorative background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center">
          {/* Badge */}
          <Badge
            variant="outline"
            className="mb-6 px-4 py-1.5 text-sm font-medium text-muted-foreground"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
            Your all-in-one workspace
          </Badge>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Stop switching between apps.{" "}
            <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
              Start getting things done.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            ProductivityOS replaces Trello, Slack, Notion, and Asana with one
            fast, beautiful platform your whole team will love.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base"
              asChild
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          {/* ── App Preview Mockup ── */}
          <div className="mx-auto mt-20 max-w-4xl">
            <div className="rounded-2xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent p-[1px]">
              <div className="rounded-2xl bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-sm">
                {/* Fake title bar */}
                <div className="flex items-center gap-2 border-b px-5 py-3">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-4 text-xs text-muted-foreground">
                    ProductivityOS
                  </span>
                </div>

                {/* Module grid inside the mockup */}
                <div className="grid grid-cols-2 gap-4 p-6 md:gap-6 md:p-8">
                  {/* Tasks */}
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-background/60 p-6 md:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                      <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold">Tasks</span>
                  </div>

                  {/* Chat */}
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-background/60 p-6 md:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                      <MessageSquare className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-semibold">Chat</span>
                  </div>

                  {/* Docs */}
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-background/60 p-6 md:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                      <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold">Docs</span>
                  </div>

                  {/* Reports */}
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-background/60 p-6 md:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-semibold">Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── Trusted By ──────────────────────── */}
      <section className="border-y py-10">
        <div className="container mx-auto px-4">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {trustedBy.map((company) => (
              <span
                key={company}
                className="text-lg font-semibold tracking-tight text-muted-foreground/50"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Features ──────────────────────── */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One platform. Zero tab switching.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div
                    className={
                      "mb-4 flex h-11 w-11 items-center justify-center rounded-xl " +
                      feature.color
                    }
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── AI Differentiator ──────────────────── */}
      <section className="relative py-24 md:py-32">
        {/* Gradient background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-violet-50/80 via-indigo-50/50 to-transparent dark:from-violet-950/20 dark:via-indigo-950/10 dark:to-transparent"
        />

        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400"
            >
              <Zap className="mr-1 h-3 w-3" />
              AI-Powered
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI that actually helps
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not just a chatbot. Real intelligence built into every workflow.
            </p>
          </div>

          {/* AI feature cards */}
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {aiFeatures.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
                  <item.icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── CTA ────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to try it?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">
            Free for teams up to 5. No credit card required.
          </p>
          <Button size="lg" className="mt-8 h-12 px-10 text-base" asChild>
            <Link href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

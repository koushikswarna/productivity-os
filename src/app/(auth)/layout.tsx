export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground space-y-6">
          <h1 className="text-4xl font-bold">ProductivityOS</h1>
          <p className="text-lg text-primary-foreground/80">
            The all-in-one workspace that replaces Trello, Slack, Asana, and Notion.
            Manage tasks, chat with your team, create documents, and get AI-powered insights.
          </p>
          <div className="space-y-3 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
              <span>Kanban boards with drag-and-drop</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
              <span>Real-time team chat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
              <span>Rich document editor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
              <span>AI-powered analytics and reports</span>
            </div>
          </div>
        </div>
      </div>
      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, plan")
    .neq("plan", "free")

  if (!orgs || orgs.length === 0) {
    return NextResponse.json({ message: "No eligible organizations" })
  }

  for (const org of orgs) {
    try {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("status, priority, due_date, created_at")
        .eq("organization_id", org.id)

      if (!tasks || tasks.length === 0) continue

      const now = new Date()
      const summary = {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "done").length,
        overdue: tasks.filter(
          (t) =>
            t.due_date &&
            new Date(t.due_date) < now &&
            t.status !== "done"
        ).length,
        urgent: tasks.filter(
          (t) => t.priority === "urgent" && t.status !== "done"
        ).length,
      }

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `Generate a brief daily insight for team "${org.name}". Stats: ${JSON.stringify(summary)}. Provide 2-3 actionable observations in JSON format: { "insights": ["insight1", "insight2"] }`,
          },
        ],
      })

      const content =
        message.content[0].type === "text" ? message.content[0].text : ""

      await supabase.from("ai_insights").insert({
        organization_id: org.id,
        type: "daily_digest",
        content: { raw: content, summary },
      })
    } catch (error) {
      console.error(`Error generating insights for org ${org.id}:`, error)
    }
  }

  return NextResponse.json({
    message: "Daily insights generated",
    orgs: orgs.length,
  })
}

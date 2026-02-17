import { NextResponse } from 'next/server'
import { getAnthropicClient, MODELS } from '@/lib/ai/client'
import { checkAIRateLimit } from '@/lib/ai/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { reportGenerationPrompt } from '@/lib/ai/prompts/report-generation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId, type, period } = body

    if (!organizationId || !type || !period) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, type, period' },
        { status: 400 }
      )
    }

    if (!['weekly', 'sprint', 'performance'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "weekly", "sprint", or "performance"' },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimit = await checkAIRateLimit(organizationId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', remaining: rateLimit.remaining, limit: rateLimit.limit },
        { status: 429 }
      )
    }

    // Fetch task data from supabase
    const supabase = await createClient()

    const { data: tasks } = await supabase
      .from('tasks')
      .select('status, due_date')
      .eq('organization_id', organizationId)

    const allTasks = tasks || []
    const now = new Date()
    const taskMetrics = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === 'done').length,
      in_progress: allTasks.filter(t => t.status === 'in_progress').length,
      overdue: allTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length,
    }

    // Fetch team stats
    const { data: members } = await supabase
      .from('organization_members')
      .select('user_id, user:profiles!user_id(full_name)')
      .eq('organization_id', organizationId)

    const teamStats = await Promise.all(
      (members || []).map(async (member) => {
        const name = (member.user as any)?.full_name || 'Unknown'

        const { count: assigned } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('assignee_id', member.user_id)

        const { count: completed } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('assignee_id', member.user_id)
          .eq('status', 'done')

        return {
          member: name,
          tasks_completed: completed || 0,
          tasks_assigned: assigned || 0,
        }
      })
    )

    // Fetch recent activity
    const { data: activities } = await supabase
      .from('activity_log')
      .select('action, metadata, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(50)

    const activitySummary = (activities || [])
      .map(a => `[${a.created_at}] ${a.action}: ${JSON.stringify(a.metadata)}`)
      .join('\n')

    // Build prompt
    const prompt = reportGenerationPrompt({
      type,
      period,
      tasks: taskMetrics,
      team_stats: teamStats,
      activity_summary: activitySummary || 'No recent activity recorded.',
    })

    // Call Anthropic with streaming
    const anthropic = getAnthropicClient()
    const stream = await anthropic.messages.stream({
      model: MODELS.powerful,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    let fullContent = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const text = event.delta.text
              fullContent += text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Save to ai_insights after stream completes
          await supabase.from('ai_insights').insert({
            organization_id: organizationId,
            type: `${type}_report`,
            content: fullContent,
            generated_at: new Date().toISOString(),
          })

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Report API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

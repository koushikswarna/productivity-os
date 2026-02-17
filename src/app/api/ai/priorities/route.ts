import { NextResponse } from 'next/server'
import { getAnthropicClient, MODELS } from '@/lib/ai/client'
import { checkAIRateLimit } from '@/lib/ai/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { taskPrioritiesPrompt } from '@/lib/ai/prompts/task-priorities'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId, projectId } = body

    if (!organizationId || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, projectId' },
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

    // Fetch tasks for the project with assignee profile name
    const supabase = await createClient()
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('title, status, priority, due_date, created_at, assignee:profiles(full_name)')
      .eq('project_id', projectId)
      .eq('organization_id', organizationId)

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json(
        { error: 'No tasks found for this project' },
        { status: 400 }
      )
    }

    // Format tasks for the prompt
    const formattedTasks = tasks.map(task => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      assignee: (task.assignee as any)?.full_name || null,
      due_date: task.due_date,
      created_at: task.created_at,
    }))

    // Build prompt and call Anthropic
    const prompt = taskPrioritiesPrompt(formattedTasks)
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: MODELS.fast,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to ai_insights
    await supabase.from('ai_insights').insert({
      organization_id: organizationId,
      type: 'task_priorities',
      content,
      metadata: { project_id: projectId },
      generated_at: new Date().toISOString(),
    })

    return NextResponse.json({ result: content })
  } catch (error) {
    console.error('Priorities API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

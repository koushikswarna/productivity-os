import { NextResponse } from 'next/server'
import { getAnthropicClient, MODELS } from '@/lib/ai/client'
import { checkAIRateLimit } from '@/lib/ai/rate-limit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizationId } = body

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Missing required field: organizationId' },
        { status: 400 }
      )
    }

    const rateLimit = await checkAIRateLimit(organizationId)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', remaining: rateLimit.remaining, limit: rateLimit.limit },
        { status: 429 }
      )
    }

    const supabase = await createClient()

    // Fetch KPIs with recent entries
    const { data: kpis } = await supabase
      .from('kpis')
      .select('name, unit, target_value, current_value, entries:kpi_entries(value, recorded_at)')
      .eq('organization_id', organizationId)
      .order('created_at')

    // Fetch tasks for analysis (even without KPIs)
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, status, priority, due_date, assignee:profiles!assignee_id(full_name)')
      .eq('organization_id', organizationId)

    const now = new Date()
    const allTasks = tasks || []
    const taskSummary = {
      total: allTasks.length,
      done: allTasks.filter(t => t.status === 'done').length,
      in_progress: allTasks.filter(t => t.status === 'in_progress').length,
      todo: allTasks.filter(t => t.status === 'todo').length,
      overdue: allTasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length,
      urgent: allTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
    }

    // Fetch recent activity log
    const { data: activities } = await supabase
      .from('activity_log')
      .select('action, entity_type, metadata, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Format data for prompt
    const kpiData = (kpis || []).map(kpi => ({
      name: kpi.name,
      unit: kpi.unit,
      target: kpi.target_value,
      current: kpi.current_value,
      entries: (kpi.entries as any[])?.slice(0, 10) || [],
    }))

    const activityFormatted = (activities || [])
      .map(a => `[${a.created_at}] ${a.action} (${a.entity_type})`)
      .join('\n') || 'No recent activity.'

    // Build prompt
    const prompt = `You are a business intelligence AI analyst. Analyze the following organizational data and provide actionable insights.

${kpiData.length > 0 ? `KPI DATA:
${JSON.stringify(kpiData, null, 2)}` : 'No KPIs configured yet.'}

TASK OVERVIEW:
- Total tasks: ${taskSummary.total}
- Completed: ${taskSummary.done}
- In Progress: ${taskSummary.in_progress}
- To Do: ${taskSummary.todo}
- Overdue: ${taskSummary.overdue}
- High/Urgent Priority: ${taskSummary.urgent}

${allTasks.length > 0 ? `TASK DETAILS (sample):
${JSON.stringify(allTasks.slice(0, 20).map(t => ({
  title: t.title,
  status: t.status,
  priority: t.priority,
  due: t.due_date,
  assignee: (t.assignee as any)?.full_name || 'Unassigned'
})), null, 2)}` : ''}

RECENT ACTIVITY:
${activityFormatted}

Provide your analysis in the following JSON format:
{
  "trends": [{"area": "Area name", "trend": "increasing/decreasing/stable", "details": "Specific observation"}],
  "anomalies": [{"metric": "What was unusual", "description": "Why it's notable", "severity": "low/medium/high"}],
  "recommendations": [{"area": "Focus area", "action": "Specific recommendation", "priority": "low/medium/high", "expected_impact": "What improvement to expect"}],
  "overall_health": "Brief assessment of organizational health based on available data"
}`

    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: MODELS.powerful,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    await supabase.from('ai_insights').insert({
      organization_id: organizationId,
      type: 'organizational_insights',
      content,
      generated_at: new Date().toISOString(),
    })

    return NextResponse.json({ result: content })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

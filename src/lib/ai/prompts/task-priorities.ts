export function taskPrioritiesPrompt(tasks: { title: string; status: string; priority: string; assignee: string | null; due_date: string | null; created_at: string }[]) {
  const now = new Date().toISOString()
  const formatted = JSON.stringify(tasks, null, 2)
  return `You are a project management AI assistant. Today is ${now}. Analyze these ${tasks.length} tasks and provide priority recommendations to help the team work more efficiently.

TASKS:
${formatted}

Analyze for:
- Overdue tasks (due_date < today and status is not "done")
- Bottlenecks (too many tasks in one status or assigned to one person)
- Unassigned high-priority tasks
- Tasks that have been in "todo" or "in_progress" for too long

Respond in this JSON format:
{
  "bottlenecks": [{"issue": "Description of the bottleneck", "severity": "high/medium/low", "suggestion": "How to fix it"}],
  "recommendations": [{"task": "Task title", "action": "What should be done", "reason": "Why this matters"}],
  "risk_areas": [{"area": "Area of concern", "impact": "What could go wrong", "mitigation": "How to prevent it"}],
  "workload_balance": "Assessment of how evenly work is distributed across team members",
  "suggested_focus": ["Top 3 tasks the team should focus on next, in priority order"],
  "quick_wins": ["Tasks that appear easy to complete and would reduce the backlog"]
}

Be actionable and specific. Reference actual task titles.`
}

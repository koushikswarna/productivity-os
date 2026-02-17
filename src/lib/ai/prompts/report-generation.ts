export function reportGenerationPrompt(data: {
  type: 'weekly' | 'sprint' | 'performance'
  period: string
  tasks: { total: number; completed: number; in_progress: number; overdue: number }
  team_stats: { member: string; tasks_completed: number; tasks_assigned: number }[]
  activity_summary: string
}) {
  return `You are a business analytics AI. Generate a comprehensive ${data.type} report.

REPORT PERIOD: ${data.period}

TASK METRICS:
- Total Tasks: ${data.tasks.total}
- Completed: ${data.tasks.completed}
- In Progress: ${data.tasks.in_progress}
- Overdue: ${data.tasks.overdue}

TEAM PERFORMANCE:
${data.team_stats.map(s => `- ${s.member}: ${s.tasks_completed}/${s.tasks_assigned} tasks completed`).join('\n')}

ACTIVITY SUMMARY:
${data.activity_summary}

Generate a detailed report in markdown format with:
1. Executive Summary
2. Key Metrics & KPIs
3. Team Performance Analysis
4. Accomplishments
5. Areas for Improvement
6. Recommendations for Next Period

Use clear headings, bullet points, and be specific with data references.`
}

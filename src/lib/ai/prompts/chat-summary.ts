export function chatSummaryPrompt(messages: { user: string; content: string; timestamp: string }[]) {
  const formatted = messages.map(m => `[${m.timestamp}] ${m.user}: ${m.content}`).join('\n')
  return `You are an AI assistant analyzing a team chat conversation. Your job is to extract the most valuable information so team members can quickly catch up.

CONVERSATION (${messages.length} messages):
${formatted}

Provide a comprehensive summary in the following JSON format:
{
  "summary": "A 2-4 sentence overview of the conversation covering the main topics and tone",
  "key_decisions": ["Any decisions that were made or agreed upon"],
  "action_items": [{"task": "Specific action that needs to be done", "assignee": "Person responsible (or 'Unassigned' if unclear)", "urgency": "high/medium/low"}],
  "topics": ["Main topics/themes discussed"],
  "unresolved": ["Any questions or issues that were raised but not resolved"],
  "sentiment": "positive/neutral/negative — overall team mood"
}

Be specific and reference actual content from the messages. If there are no decisions, action items, or unresolved issues, use empty arrays.`
}

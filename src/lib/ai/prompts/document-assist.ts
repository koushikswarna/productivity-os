export function documentSummaryPrompt(title: string, content: string) {
  return `Summarize the following document concisely.

TITLE: ${title}

CONTENT:
${content}

Provide:
1. A 2-3 sentence summary
2. Key points (bullet list)
3. Any action items mentioned`
}

export function documentEditSuggestionsPrompt(title: string, content: string) {
  return `Review the following document and suggest improvements.

TITLE: ${title}

CONTENT:
${content}

Provide suggestions for:
1. Clarity improvements
2. Missing information
3. Structure/organization
4. Grammar and style

Be specific and actionable.`
}

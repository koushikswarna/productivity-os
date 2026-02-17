import { NextResponse } from 'next/server'
import { getAnthropicClient, MODELS } from '@/lib/ai/client'
import { checkAIRateLimit } from '@/lib/ai/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { chatSummaryPrompt } from '@/lib/ai/prompts/chat-summary'
import { documentSummaryPrompt } from '@/lib/ai/prompts/document-assist'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, organizationId, data } = body

    if (!type || !organizationId || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, organizationId, data' },
        { status: 400 }
      )
    }

    if (type !== 'chat' && type !== 'document') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "chat" or "document"' },
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

    // Build prompt based on type
    let prompt: string
    if (type === 'chat') {
      if (!data.messages || !Array.isArray(data.messages)) {
        return NextResponse.json(
          { error: 'Missing or invalid data.messages for chat summary' },
          { status: 400 }
        )
      }
      prompt = chatSummaryPrompt(data.messages)
    } else {
      if (!data.title || !data.content) {
        return NextResponse.json(
          { error: 'Missing data.title or data.content for document summary' },
          { status: 400 }
        )
      }
      prompt = documentSummaryPrompt(data.title, data.content)
    }

    // Call Anthropic
    const anthropic = getAnthropicClient()
    const message = await anthropic.messages.create({
      model: MODELS.fast,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to ai_insights
    const supabase = await createClient()
    await supabase.from('ai_insights').insert({
      organization_id: organizationId,
      type: `${type}_summary`,
      content,
      generated_at: new Date().toISOString(),
    })

    return NextResponse.json({ result: content })
  } catch (error) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

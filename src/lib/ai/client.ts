import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return client
}

export const MODELS = {
  fast: 'claude-haiku-4-5-20251001',
  powerful: 'claude-sonnet-4-5-20250929',
} as const

import { createClient } from '@/lib/supabase/server'

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  pro: 50,
  business: 200,
  enterprise: Infinity,
}

export async function checkAIRateLimit(organizationId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const supabase = await createClient()

  // Get org plan
  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', organizationId)
    .single()

  const plan = org?.plan || 'free'
  const limit = PLAN_LIMITS[plan] ?? 10

  if (limit === Infinity) return { allowed: true, remaining: Infinity, limit }

  // Count today's AI insights/usages
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ai_insights')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('generated_at', today.toISOString())

  const used = count || 0
  const remaining = Math.max(0, limit - used)

  return { allowed: remaining > 0, remaining, limit }
}

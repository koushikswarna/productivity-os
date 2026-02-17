"use client"
import { useState } from "react"
import { Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useOrg } from "@/lib/hooks/use-org"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const plans = [
  { key: "free", name: "Free", price: 0, recommended: false, features: ["5 members", "1GB storage", "Basic task management", "AI features (10/day)", "3 projects"], aiRequests: "10/day" },
  { key: "pro", name: "Pro", price: 10, recommended: true, features: ["25 members", "10GB storage", "Unlimited projects", "AI features (50/day)", "Team chat", "Document editor"], aiRequests: "50/day" },
  { key: "business", name: "Business", price: 25, recommended: false, features: ["100 members", "100GB storage", "Everything in Pro", "AI features (200/day)", "Advanced analytics", "Priority support"], aiRequests: "200/day" },
  { key: "enterprise", name: "Enterprise", price: 50, recommended: false, features: ["Unlimited members", "1TB storage", "Everything in Business", "Unlimited AI", "Custom integrations", "Dedicated support", "SSO"], aiRequests: "Unlimited" },
]

export default function BillingPage() {
  const { organization } = useOrg()
  const currentPlan = organization?.plan || "free"
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planKey: string) => {
    if (planKey === currentPlan) return
    setLoading(planKey)
    try {
      // In production, this would create a Stripe checkout session
      toast.info("Stripe checkout would open here. Configure STRIPE_SECRET_KEY to enable billing.")
    } catch (e: any) { toast.error(e.message) }
    finally { setLoading(null) }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Choose the right plan for your team</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={cn(
              "relative",
              plan.key === currentPlan && "border-primary ring-1 ring-primary",
              plan.recommended && plan.key !== currentPlan && "border-blue-500 ring-1 ring-blue-500"
            )}
          >
            {plan.key === currentPlan && <Badge className="absolute -top-2.5 left-4">Current Plan</Badge>}
            {plan.recommended && plan.key !== currentPlan && (
              <Badge className="absolute -top-2.5 left-4 bg-blue-500 hover:bg-blue-600">Most Popular</Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground">/user/mo</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500 shrink-0" />{f}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.key === currentPlan ? "outline" : "default"} disabled={plan.key === currentPlan || loading === plan.key} onClick={() => handleUpgrade(plan.key)}>
                {plan.key === currentPlan ? "Current" : loading === plan.key ? "Loading..." : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

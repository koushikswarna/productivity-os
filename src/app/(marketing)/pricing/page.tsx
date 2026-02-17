import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const plans = [
  { name: "Free", price: 0, description: "For individuals", features: ["5 members", "3 projects", "1GB storage", "Basic task management", "Community support"], popular: false },
  { name: "Pro", price: 10, description: "For small teams", features: ["25 members", "Unlimited projects", "10GB storage", "AI features (50/day)", "Team chat & docs", "Email support"], popular: true },
  { name: "Business", price: 25, description: "For growing companies", features: ["100 members", "Unlimited projects", "100GB storage", "AI features (200/day)", "Advanced analytics", "Custom dashboards", "Priority support"], popular: false },
  { name: "Enterprise", price: 50, description: "For large organizations", features: ["Unlimited members", "Unlimited projects", "1TB storage", "Unlimited AI", "SSO & SAML", "Custom integrations", "Dedicated support", "SLA guarantee"], popular: false },
]

export default function PricingPage() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">Start free, scale as you grow. No hidden fees.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={cn("relative", plan.popular && "border-primary shadow-lg scale-105")}>
              {plan.popular && <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most Popular</Badge>}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/user/mo</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500 shrink-0" />{f}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link href="/signup">{plan.price === 0 ? "Start Free" : "Get Started"}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

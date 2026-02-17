import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
  })
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Missing configuration" }, { status: 400 })
  }

  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Import supabase admin client
  const { createClient } = await import("@supabase/supabase-js")
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.organization_id
      if (orgId) {
        await supabaseAdmin.from("organizations").update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan: session.metadata?.plan || "pro",
        }).eq("id", orgId)
      }
      break
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const { data: org } = await supabaseAdmin.from("organizations").select("id").eq("stripe_subscription_id", sub.id).single()
      if (org) {
        const status = sub.status === "active" ? (sub.metadata?.plan || "pro") : "free"
        await supabaseAdmin.from("organizations").update({ plan: status }).eq("id", org.id)
      }
      break
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      await supabaseAdmin.from("organizations").update({ plan: "free", stripe_subscription_id: null }).eq("stripe_subscription_id", sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}

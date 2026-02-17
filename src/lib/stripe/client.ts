import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

export const PLANS = {
  free: { name: 'Free', price: 0, priceId: null, aiRequests: 0, members: 5, storage: '1GB' },
  pro: { name: 'Pro', price: 10, priceId: 'price_pro_monthly', aiRequests: 50, members: 25, storage: '10GB' },
  business: { name: 'Business', price: 25, priceId: 'price_business_monthly', aiRequests: 200, members: 100, storage: '100GB' },
  enterprise: { name: 'Enterprise', price: 50, priceId: 'price_enterprise_monthly', aiRequests: -1, members: -1, storage: '1TB' },
} as const

export type PlanKey = keyof typeof PLANS

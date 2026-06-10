export const PLANS = {
  free: {
    name: 'Free',
    store_limit: 1,
    product_limit: 100,
    order_limit_per_month: 50,
  },
  starter: {
    name: 'Starter',
    store_limit: 3,
    product_limit: 1000,
    order_limit_per_month: 500,
  },
  pro: {
    name: 'Pro',
    store_limit: 10,
    product_limit: 10000,
    order_limit_per_month: 5000,
  },
  agency: {
    name: 'Agency',
    store_limit: 100,
    product_limit: 100000,
    order_limit_per_month: 50000,
  },
} as const

export type PlanName = keyof typeof PLANS

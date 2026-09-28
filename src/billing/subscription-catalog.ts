/**
 * Proposed FactLedger subscription catalog. Pricing is not live checkout.
 * All money uses integer minor units; prices and entitlements are server-owned.
 * NEVER activate an account from a browser redirect or an unverified callback.
 */
export type PlanId = 'developer' | 'business';
export type SubscriptionStatus = 'pending_payment' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface Plan {
  id: PlanId;
  currency: 'USD';
  monthlyPriceMinor: number;
  interval: 'month';
  label: string;
}

export const SUBSCRIPTION_PLANS: Readonly<Record<PlanId, Readonly<Plan>>> = Object.freeze({
  developer: Object.freeze({
    id: 'developer', label: 'Developer', currency: 'USD',
    monthlyPriceMinor: 4900, interval: 'month',
  }),
  business: Object.freeze({
    id: 'business', label: 'Business', currency: 'USD',
    monthlyPriceMinor: 19900, interval: 'month',
  }),
});

export function getSubscriptionPlan(id: string): Readonly<Plan> | null {
  return Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, id)
    ? SUBSCRIPTION_PLANS[id as PlanId]
    : null;
}

/** An entitlement is valid only when payment has been reconciled server-side. */
export function canAccessPaidAPI(
  subscription: { status: SubscriptionStatus; paidThrough: string } | null,
  now: Date = new Date(),
): boolean {
  if (!subscription || subscription.status !== 'active' || !Number.isFinite(now.getTime())) return false;
  const until = new Date(subscription.paidThrough);
  return Number.isFinite(until.getTime()) && until.getTime() > now.getTime();
}

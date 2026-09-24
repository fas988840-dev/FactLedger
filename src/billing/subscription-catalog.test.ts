import { describe, expect, it } from 'vitest';
import { canAccessPaidAPI, getSubscriptionPlan, SUBSCRIPTION_PLANS } from './subscription-catalog.js';

describe('subscription catalog', () => {
  it('uses a server-owned immutable price per plan', () => {
    expect(getSubscriptionPlan('developer')?.monthlyPriceMinor).toBe(4900);
    expect(getSubscriptionPlan('business')?.monthlyPriceMinor).toBe(19900);
    expect(Object.isFrozen(SUBSCRIPTION_PLANS.developer)).toBe(true);
  });
  it('rejects unknown or client-supplied plan identifiers', () => {
    expect(getSubscriptionPlan('free')).toBeNull();
    expect(getSubscriptionPlan('__proto__')).toBeNull();
    expect(getSubscriptionPlan('developer?price=1')).toBeNull();
  });
  it('does not grant access before verified activation or after expiry', () => {
    const now = new Date('2026-09-24T12:00:00Z');
    expect(canAccessPaidAPI(null, now)).toBe(false);
    expect(canAccessPaidAPI({ status: 'pending_payment', paidThrough: '2026-10-24T12:00:00Z' }, now)).toBe(false);
    expect(canAccessPaidAPI({ status: 'active', paidThrough: '2026-09-24T12:00:00Z' }, now)).toBe(false);
    expect(canAccessPaidAPI({ status: 'active', paidThrough: 'bad-date' }, now)).toBe(false);
    expect(canAccessPaidAPI({ status: 'active', paidThrough: '2026-10-24T12:00:00Z' }, now)).toBe(true);
    expect(canAccessPaidAPI({ status: 'canceled', paidThrough: '2026-10-24T12:00:00Z' }, now)).toBe(false);
  });
});

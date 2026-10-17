import { describe, expect, it } from 'vitest';
import {
  API_PLANS,
  calculateMonthlyRevenueProjection,
  InMemoryUsageStore,
  isWithinPlanLimit,
  parseApiKeyPlans,
  resolveApiKeyEntitlement,
  usagePeriod,
} from './api-plan.js';

describe('API plans', () => {
  it('parses only known plan names', () => {
    const map = parseApiKeyPlans(JSON.stringify({ a: 'pro', b: 'bogus', c: 'enterprise' }));
    expect(map.get('a')).toBe('pro');
    expect(map.has('b')).toBe(false);
    expect(map.get('c')).toBe('enterprise');
  });

  it('defaults a configured key to free when no paid entitlement is present', () => {
    expect(resolveApiKeyEntitlement('key-1', ['key-1'], new Map())).toEqual({ apiKey: 'key-1', plan: 'free' });
    expect(resolveApiKeyEntitlement('missing', ['key-1'], new Map())).toBeNull();
  });

  it('tracks usage by key and UTC month', () => {
    const store = new InMemoryUsageStore();
    const period = usagePeriod(new Date('2026-09-04T09:00:00Z'));
    expect(period).toBe('2026-09');
    expect(store.increment('key', period)).toBe(1);
    expect(store.increment('key', period)).toBe(2);
    expect(store.get('key', period)).toBe(2);
  });

  it('enforces finite plan limits and permits enterprise unlimited usage', () => {
    expect(isWithinPlanLimit(API_PLANS.free, 1_000)).toBe(true);
    expect(isWithinPlanLimit(API_PLANS.free, 1_001)).toBe(false);
    expect(isWithinPlanLimit(API_PLANS.enterprise, Number.MAX_SAFE_INTEGER)).toBe(true);
  });

  it('calculates deterministic monthly revenue projections and validates >=$10k/month target', () => {
    const projection = calculateMonthlyRevenueProjection({
      proSubscribers: 10,
      businessSubscribers: 6,
      enterpriseSubscribers: 1,
      institutionalAuditReportsPerMonth: 6,
      auditReportPriceUsd: 500,
      micropaymentRequestsPerMonth: 3500,
      micropaymentPriceUsd: 0.3,
      ecosystemGrantsAndSponsorsMonthlyUsd: 1500,
    });
    expect(projection.subscriptionsMrrUsd).toBe(10 * 149 + 6 * 499 + 1 * 1500);
    expect(projection.auditReportsMonthlyUsd).toBe(3000);
    expect(projection.micropaymentsMonthlyUsd).toBe(1050);
    expect(projection.totalMonthlyRevenueUsd).toBe(11534);
    expect(projection.meets10kMonthlyTarget).toBe(true);
  });
});

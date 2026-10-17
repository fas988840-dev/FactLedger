export type ApiPlanName = 'free' | 'pro' | 'business' | 'enterprise';

export interface ApiPlan {
  name: ApiPlanName;
  monthlyRequestLimit: number | null;
  maxConcurrentStreams: number;
  support: 'community' | 'standard' | 'priority' | 'custom';
  monthlyPriceUsd: number;
}

export const API_PLANS: Record<ApiPlanName, ApiPlan> = {
  free: { name: 'free', monthlyRequestLimit: 1_000, maxConcurrentStreams: 1, support: 'community', monthlyPriceUsd: 0 },
  pro: { name: 'pro', monthlyRequestLimit: 25_000, maxConcurrentStreams: 3, support: 'standard', monthlyPriceUsd: 149 },
  business: { name: 'business', monthlyRequestLimit: 250_000, maxConcurrentStreams: 10, support: 'priority', monthlyPriceUsd: 499 },
  enterprise: { name: 'enterprise', monthlyRequestLimit: null, maxConcurrentStreams: 50, support: 'custom', monthlyPriceUsd: 1_500 },
};

export interface RevenueProjectionInput {
  proSubscribers: number;
  businessSubscribers: number;
  enterpriseSubscribers: number;
  institutionalAuditReportsPerMonth: number;
  auditReportPriceUsd?: number;
  micropaymentRequestsPerMonth?: number;
  micropaymentPriceUsd?: number;
  ecosystemGrantsAndSponsorsMonthlyUsd?: number;
}

export interface RevenueProjectionSummary {
  subscriptionsMrrUsd: number;
  auditReportsMonthlyUsd: number;
  micropaymentsMonthlyUsd: number;
  grantsAndSponsorsMonthlyUsd: number;
  totalMonthlyRevenueUsd: number;
  annualizedRunRateUsd: number;
  meets10kMonthlyTarget: boolean;
}

export function calculateMonthlyRevenueProjection(input: RevenueProjectionInput): RevenueProjectionSummary {
  const pro = Math.max(0, Math.floor(input.proSubscribers)) * API_PLANS.pro.monthlyPriceUsd;
  const business = Math.max(0, Math.floor(input.businessSubscribers)) * API_PLANS.business.monthlyPriceUsd;
  const enterprise = Math.max(0, Math.floor(input.enterpriseSubscribers)) * API_PLANS.enterprise.monthlyPriceUsd;
  const subscriptionsMrrUsd = pro + business + enterprise;

  const reportPrice = input.auditReportPriceUsd ?? 500;
  const auditReportsMonthlyUsd = Math.max(0, Math.floor(input.institutionalAuditReportsPerMonth)) * reportPrice;

  const microPrice = input.micropaymentPriceUsd ?? 0.3;
  const micropaymentsMonthlyUsd = Math.round(Math.max(0, Math.floor(input.micropaymentRequestsPerMonth ?? 0)) * microPrice);

  const grantsAndSponsorsMonthlyUsd = Math.max(0, Math.round(input.ecosystemGrantsAndSponsorsMonthlyUsd ?? 0));

  const totalMonthlyRevenueUsd =
    subscriptionsMrrUsd + auditReportsMonthlyUsd + micropaymentsMonthlyUsd + grantsAndSponsorsMonthlyUsd;

  return {
    subscriptionsMrrUsd,
    auditReportsMonthlyUsd,
    micropaymentsMonthlyUsd,
    grantsAndSponsorsMonthlyUsd,
    totalMonthlyRevenueUsd,
    annualizedRunRateUsd: totalMonthlyRevenueUsd * 12,
    meets10kMonthlyTarget: totalMonthlyRevenueUsd >= 10_000,
  };
}

export interface ApiKeyEntitlement {
  apiKey: string;
  plan: ApiPlanName;
}

export function parseApiKeyPlans(raw: string | undefined): Map<string, ApiPlanName> {
  const result = new Map<string, ApiPlanName>();
  if (!raw) return result;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return result;

    for (const [apiKey, plan] of Object.entries(parsed)) {
      if (!apiKey.trim()) continue;
      if (plan === 'free' || plan === 'pro' || plan === 'business' || plan === 'enterprise') {
        result.set(apiKey, plan);
      }
    }
  } catch {
    return result;
  }

  return result;
}

/**
 * Resolves a configured API key to a commercial entitlement. Existing keys
 * remain backwards-compatible: a key present in API_KEYS but absent from the
 * plan map receives the free entitlement rather than an invented paid plan.
 */
export function resolveApiKeyEntitlement(
  providedKey: string | undefined,
  configuredKeys: string[],
  planMap: Map<string, ApiPlanName>
): ApiKeyEntitlement | null {
  if (!providedKey || !configuredKeys.includes(providedKey)) return null;
  return { apiKey: providedKey, plan: planMap.get(providedKey) ?? 'free' };
}

export interface UsageSnapshot {
  apiKey: string;
  period: string;
  requests: number;
}

export interface UsageStore {
  increment(apiKey: string, period: string): number;
  get(apiKey: string, period: string): number;
}

/**
 * Development/test meter only. Production billing must use a durable store so
 * service restarts cannot reset usage or create an entitlement bypass.
 */
export class InMemoryUsageStore implements UsageStore {
  private readonly counts = new Map<string, number>();

  increment(apiKey: string, period: string): number {
    const key = `${period}:${apiKey}`;
    const next = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, next);
    return next;
  }

  get(apiKey: string, period: string): number {
    return this.counts.get(`${period}:${apiKey}`) ?? 0;
  }
}

export function usagePeriod(timestamp = new Date()): string {
  return `${timestamp.getUTCFullYear()}-${String(timestamp.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function isWithinPlanLimit(plan: ApiPlan, requestCount: number): boolean {
  return plan.monthlyRequestLimit === null || requestCount <= plan.monthlyRequestLimit;
}

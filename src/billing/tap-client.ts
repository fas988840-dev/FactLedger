export interface TapSavedCardTokenRequest {
  saved_card: { card_id: string; customer_id: string };
}

export interface TapTokenResponse { id: string }

export function buildSavedCardTokenRequest(cardId: string, customerId: string): TapSavedCardTokenRequest {
  if (!cardId.startsWith('card_')) throw new Error('Invalid Tap card id');
  if (!customerId.startsWith('cus_')) throw new Error('Invalid Tap customer id');
  return { saved_card: { card_id: cardId, customer_id: customerId } };
}

/**
 * Creates a fresh single-use Tap token from a saved card.
 * Never send raw PAN/CVC through FactLedger.
 */
export async function createSavedCardToken(
  cardId: string,
  customerId: string,
  secretKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  if (!secretKey.startsWith('sk_')) throw new Error('Tap secret key required');
  const response = await fetchImpl('https://api.tap.company/v2/tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildSavedCardTokenRequest(cardId, customerId)),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Tap saved-card token request failed (HTTP ${response.status})`);
  const body = await response.json() as Partial<TapTokenResponse>;
  if (typeof body.id !== 'string' || !body.id.startsWith('tok_')) throw new Error('Tap returned invalid token id');
  return body.id;
}

export interface TapRecurringChargeInput {
  amount: number;
  currency: string;
  customerId: string;
  tokenId: string;
  paymentAgreementId: string;
  postUrl?: string;
}

export function buildRecurringChargeRequest(input: TapRecurringChargeInput) {
  if (!(input.amount > 0) || !Number.isFinite(input.amount)) throw new Error('Invalid amount');
  if (!/^[A-Z]{3}$/.test(input.currency)) throw new Error('Invalid currency');
  if (!input.customerId.startsWith('cus_')) throw new Error('Invalid Tap customer id');
  if (!input.tokenId.startsWith('tok_')) throw new Error('Invalid Tap token id');
  if (!input.paymentAgreementId.startsWith('payment_agreement_')) throw new Error('Invalid payment agreement id');
  return {
    amount: input.amount,
    currency: input.currency,
    threeDSecure: false,
    save_card: false,
    customer_initiated: false,
    customer: { id: input.customerId },
    source: { id: input.tokenId },
    payment_agreement: { id: input.paymentAgreementId },
    ...(input.postUrl ? { post: { url: input.postUrl } } : {}),
  };
}

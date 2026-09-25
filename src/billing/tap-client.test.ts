import { describe, expect, it, vi } from 'vitest';
import { buildRecurringChargeRequest, buildSavedCardTokenRequest, createSavedCardToken } from './tap-client.js';

describe('Tap saved-card tokenization', () => {
  it('uses the exact saved_card body shape required by Tap', () => {
    expect(buildSavedCardTokenRequest('card_123', 'cus_456')).toEqual({
      saved_card: { card_id: 'card_123', customer_id: 'cus_456' },
    });
  });

  it('posts the saved-card request and returns the one-time token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'tok_789' }),
    });
    await expect(createSavedCardToken('card_123', 'cus_456', 'sk_test_secret', fetchMock as unknown as typeof fetch))
      .resolves.toBe('tok_789');
    expect(fetchMock).toHaveBeenCalledWith('https://api.tap.company/v2/tokens', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ saved_card: { card_id: 'card_123', customer_id: 'cus_456' } }),
    }));
  });

  it('builds merchant-initiated recurring charge from token + customer + agreement', () => {
    expect(buildRecurringChargeRequest({
      amount: 49,
      currency: 'USD',
      customerId: 'cus_456',
      tokenId: 'tok_789',
      paymentAgreementId: 'payment_agreement_abc',
    })).toMatchObject({
      amount: 49,
      currency: 'USD',
      threeDSecure: false,
      save_card: false,
      customer_initiated: false,
      customer: { id: 'cus_456' },
      source: { id: 'tok_789' },
      payment_agreement: { id: 'payment_agreement_abc' },
    });
  });
});

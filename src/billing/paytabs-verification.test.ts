import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  matchesSuccessfulPayTabsSale,
  verifyPayTabsSignature,
  type ExpectedPayTabsOrder,
  type PayTabsCallback,
} from './paytabs-verification.js';

const order: ExpectedPayTabsOrder = {
  cartId: 'sandbox-order-1',
  profileId: '12345',
  currency: 'SAR',
  amountInMinorUnits: 4900,
};

const callback: PayTabsCallback = {
  profile_id: 12345,
  cart_id: 'sandbox-order-1',
  cart_currency: 'SAR',
  cart_amount: '49.00',
  tran_ref: 'TST-demo-reference',
  tran_type: 'Sale',
  payment_result: { response_status: 'A' },
};

describe('PayTabs sandbox callback verification primitives', () => {
  const secret = 'sandbox-only-fake-key';
  const raw = Buffer.from(JSON.stringify(callback), 'utf8');
  const signature = createHmac('sha256', secret).update(raw).digest('hex');

  it('accepts the exact signed raw body', () => {
    expect(verifyPayTabsSignature(raw, signature, secret)).toBe(true);
  });

  it('rejects an unsigned, changed, or incorrectly signed body', () => {
    expect(verifyPayTabsSignature(raw, undefined, secret)).toBe(false);
    expect(verifyPayTabsSignature(Buffer.from(raw.toString() + ' '), signature, secret)).toBe(false);
    expect(verifyPayTabsSignature(raw, signature, 'wrong-key')).toBe(false);
    expect(verifyPayTabsSignature(raw, 'bad-signature', secret)).toBe(false);
    expect(verifyPayTabsSignature(raw, signature, '')).toBe(false);
  });

  it('checks merchant profile, order identity, currency, amount and paid sale status', () => {
    expect(matchesSuccessfulPayTabsSale(callback, order)).toBe(true);
    expect(matchesSuccessfulPayTabsSale({ ...callback, cart_amount: '4.90' }, order)).toBe(false);
    expect(matchesSuccessfulPayTabsSale({ ...callback, cart_amount: '49.001' }, order)).toBe(false);
    expect(matchesSuccessfulPayTabsSale({ ...callback, cart_currency: 'USD' }, order)).toBe(false);
    expect(matchesSuccessfulPayTabsSale({ ...callback, cart_id: 'other-order' }, order)).toBe(false);
    expect(matchesSuccessfulPayTabsSale({ ...callback, profile_id: '999' }, order)).toBe(false);
    expect(matchesSuccessfulPayTabsSale({ ...callback, tran_ref: '' }, order)).toBe(false);
    expect(matchesSuccessfulPayTabsSale({ ...callback, payment_result: { response_status: 'D' } }, order)).toBe(false);
    expect(matchesSuccessfulPayTabsSale({ ...callback, tran_type: 'refund' }, order)).toBe(false);
  });
});

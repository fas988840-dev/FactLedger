import { describe, expect, it } from 'vitest';
import { fetchMoyasarTestPayment, matchesMoyasarOrder } from './moyasar-test-verification.js';

const order = { paymentId: '12345678-1234-1234-1234-123456789abc', orderId: 'fl-test-123', amountMinor: 100, currency: 'SAR' };
const payment = { id: order.paymentId, status: 'paid', amount: 100, currency: 'SAR', refunded: 0, metadata: { order_id: order.orderId } };

describe('Moyasar sandbox payment verification', () => {
  it('matches an exact server-created order', () => {
    expect(matchesMoyasarOrder(payment, order)).toBe(true);
  });
  it('rejects unpaid, wrong order, wrong amount/currency, refunds and missing metadata', () => {
    expect(matchesMoyasarOrder({ ...payment, status: 'initiated' }, order)).toBe(false);
    expect(matchesMoyasarOrder({ ...payment, metadata: { order_id: 'other' } }, order)).toBe(false);
    expect(matchesMoyasarOrder({ ...payment, amount: 51750 }, order)).toBe(false);
    expect(matchesMoyasarOrder({ ...payment, currency: 'USD' }, order)).toBe(false);
    expect(matchesMoyasarOrder({ ...payment, refunded: 100 }, order)).toBe(false);
    expect(matchesMoyasarOrder({ ...payment, metadata: undefined }, order)).toBe(false);
    expect(matchesMoyasarOrder({ ...payment, id: 'different' }, order)).toBe(false);
  });
  it('rejects live secret keys and malformed payment IDs before network requests', async () => {
    await expect(fetchMoyasarTestPayment(order.paymentId, 'sk_live_abcdefghijk')).rejects.toThrow('test secret key');
    await expect(fetchMoyasarTestPayment('bad', 'sk_test_abcdefghijk')).rejects.toThrow('Invalid payment ID');
  });
});

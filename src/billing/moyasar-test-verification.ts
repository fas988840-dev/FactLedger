/**
 * Moyasar sandbox payment verification building block.
 *
 * This file is NOT mounted as an HTTP route and does NOT issue API keys.
 * The caller must load an immutable server-created order from durable storage,
 * reconcile a payment once by unique provider payment ID, and only then update
 * subscription entitlements transactionally. Never trust a browser redirect,
 * client-provided amount, or webhook data alone.
 */
export interface ExpectedMoyasarOrder {
  paymentId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
}
export interface MoyasarPayment {
  id?: unknown;
  status?: unknown;
  amount?: unknown;
  currency?: unknown;
  refunded?: unknown;
  metadata?: unknown;
}
export function matchesMoyasarOrder(payment: MoyasarPayment, order: ExpectedMoyasarOrder): boolean {
  const metadata = payment.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false;
  const fields = metadata as Record<string, unknown>;
  return (
    typeof order.paymentId === 'string' && order.paymentId.length > 0 &&
    typeof order.orderId === 'string' && order.orderId.length > 0 &&
    Number.isSafeInteger(order.amountMinor) && order.amountMinor > 0 &&
    /^[A-Z]{3}$/.test(order.currency) &&
    payment.id === order.paymentId &&
    fields.order_id === order.orderId &&
    payment.status === 'paid' &&
    payment.amount === order.amountMinor &&
    payment.currency === order.currency &&
    payment.refunded === 0
  );
}
/** Only verify test payments; never switch to live keys in this helper. */
export async function fetchMoyasarTestPayment(
  paymentId: string,
  testSecretKey: string,
): Promise<MoyasarPayment> {
  if (!/^[0-9a-fA-F-]{36}$/.test(paymentId)) throw new Error('Invalid payment ID');
  if (!testSecretKey.startsWith('sk_test_') || testSecretKey.length < 12) {
    throw new Error('Moyasar test secret key required');
  }
  const response = await fetch(`https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: { Authorization: `Basic ${Buffer.from(`${testSecretKey}:`).toString('base64')}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Moyasar test payment lookup failed (HTTP ${response.status})`);
  return await response.json() as MoyasarPayment;
}

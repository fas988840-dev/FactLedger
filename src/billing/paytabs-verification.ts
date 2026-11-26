/**
 * PayTabs callback verification primitives. NOT wired to live routes or billing.
 *
 * PayTabs signs the unmodified callback request BODY using HMAC-SHA256 and the
 * correct profile server key, sent in the "Signature" HTTP header.
 * Call this on the raw Buffer captured BEFORE JSON parsing.
 *
 * A verified callback is NOT sufficient for subscription activation:
 * reconcile the transaction with a server-created order in durable storage,
 * verify the gateway transaction status with the server-side payment API,
 * atomically deduplicate transaction references, and only then provision
 * an expiring, per-customer credential with enforced usage limits.
 *
 * Never log server keys, card data, raw callbacks or customer API keys.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface ExpectedPayTabsOrder {
  cartId: string;              // Generated and stored server-side
  profileId: string;           // Merchant's expected TEST profile ID
  currency: string;            // e.g. SAR
  amountInMinorUnits: number;  // e.g. 4900 = 49.00 SAR
}

export interface PayTabsCallback {
  profile_id?: number | string;
  cart_id?: string;
  cart_currency?: string;
  cart_amount?: string | number;
  tran_ref?: string;
  tran_type?: string;
  payment_result?: { response_status?: string };
}

function amountInMinorUnits(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value);
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(amount) ? amount : null;
}

/** Check exact raw-body signature; reject malformed and missing values. */
export function verifyPayTabsSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  profileServerKey: string
): boolean {
  if (!profileServerKey || !signatureHeader || !/^[a-fA-F0-9]{64}$/.test(signatureHeader)) return false;
  const expected = createHmac('sha256', profileServerKey).update(rawBody).digest();
  const received = Buffer.from(signatureHeader, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/**
 * Only returns true for a signed, successful sale matching the pre-created order.
 * This is a predicate for the next durable DB / provider-reconciliation step,
 * never an instruction to issue an API key on its own.
 */
export function matchesSuccessfulPayTabsSale(
  callback: PayTabsCallback,
  order: ExpectedPayTabsOrder
): boolean {
  return (
    String(callback.profile_id ?? '') === order.profileId &&
    callback.cart_id === order.cartId &&
    callback.cart_currency === order.currency &&
    amountInMinorUnits(callback.cart_amount) === order.amountInMinorUnits &&
    typeof callback.tran_ref === 'string' &&
    callback.tran_ref.length > 0 &&
    callback.tran_type?.toLowerCase() === 'sale' &&
    callback.payment_result?.response_status === 'A'
  );
}

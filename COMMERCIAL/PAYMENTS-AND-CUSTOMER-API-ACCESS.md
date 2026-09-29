# FactLedger — merchant onboarding and paid customer API access
Status: DRAFT ONLY. This document does not establish a merchant account, activate payment processing, issue a live customer credential, create subscribers, or transfer funds.

## Existing API behavior (verified in repository)
The application entry point is src/main.ts. Existing .env.example and docs/openapi.yaml describe the X-API-Key header with a comma-separated API_KEYS environment variable; /api/v1/health is exempt. The currently configured production keys must remain undisclosed. Do **not** replace API_KEYS with a new key without preserving any existing operational credentials and checking deployment consumers. This legacy flat key list does not track a key's customer, plan, paid status, quota, expiry or revocation.

## Saudi merchant payment onboarding
Provider candidate: PayTabs / Paymes Saudi, subject to applicant eligibility, account review, agreed fees, available card methods, recurring-billing eligibility and bank settlement setup.
Official references:
- https://support.paytabs.com/en/support/solutions/articles/60001494787 (Saudi individual freelance-certificate path and bank verification)
- https://support.paytabs.com/en/support/solutions/articles/60001569585 (freelancer certificate signup)
- https://support.paytabs.com/en/support/solutions/articles/60001245445 (recurring-billing terms URL)
- https://support.paytabs.com/en/support/solutions/articles/60000716510-what-kyc-documents-are-required-to-activate-my-paytabs-account- (review website, KYC, bank evidence)

The founder must personally choose the eligible entity category (company with CR or individual with an actual freelance certificate), submit identity and company/certificate documents, confirm legal and tax terms, register a bank account whose owner matches the merchant, and accept the gateway pricing and contract. None of these is verified complete.

Start with provider-hosted payment links/invoices for a **manually provisioned, usage-capped paid pilot** before enabling recurring autopay. Confirm whether Saudi and international payment cards, USD/SAR settlement, subscription renewals, refund methods and bank payout are available for this merchant account. A successful card charge, payment settlement to the merchant balance, and payout to the bank are different events. Never claim money reached the user's bank without gateway and bank evidence.

## Paid API credential architecture — implementation gate
Do not email an API key merely after redirect to a success URL. For automated checkout, validate provider webhook **signature as documented by provider**, verify invoice amount, currency, expected product, gateway payment status and unique payment ID server-side; deduplicate retries and record state in durable DB transactions. Untrusted browser callbacks cannot activate access.

Model: customers, subscriptions, invoices/payment_events, api_credentials (only salted hashes or provider-safe HMAC of generated bearer keys, never plaintext), plan limits, usage ledger and revocation. Generate a distinct cryptographically secure random key per customer and reveal it once after verified payment. Rate-limit by customer and enforce quota and billing state on all paid protected routes; support refunds, cancellations, chargebacks, non-payment, retries, manual key rotation and support audit logs. Restrict merchant webhook to payment state transitions and never allow payment calls to ingest the private key into log output.

Before go-live: integration tests for fake/spoofed payments, replayed webhook, wrong currency/amount, two parallel webhook deliveries, refund after issue, subscription expiry and API rate limit; load test RPC cost per customer; publish actual terms, privacy, contact, refund and pricing pages and obtain any required merchant review. No banking or merchant credentials in GitHub, chat or public screenshots.

## Pilot fulfillment procedure (manual before billing automation)
1. Founder obtains approved live merchant account and payment-link capability; verify destination bank in the **provider dashboard** privately.
2. Agree a scoped pilot price, request count, delivery window and cancellation/refund policy with an identified client, then create a hosted provider invoice/link from the verified account.
3. Founder verifies paid/settled status in provider dashboard, **not an email or screenshot supplied by buyer**.
4. Generate a new random customer key locally in the secret store; append to current API_KEYS only after preserving existing keys and using supported deployment configuration. Never commit/share the key. This temporary approach lacks per-key billing enforcement: enforce pilot usage manually and do not use it for unlimited public recurring subscriptions.
5. Run authenticated customer-specific smoke test, give customer only their own key by approved secure channel, log contract, usage and end date. Revoke promptly on expiry/refund. Build durable per-customer auth and billing before self-service scale.

## Current status
No merchant approval, bank link, payment link, charge, recurring subscription, customer-specific production key, or payout has been verified by creation of this document. The code is intentionally unchanged. Do not deploy a checkout button or promise automatic bank receipts before all merchant and implementation gates pass.

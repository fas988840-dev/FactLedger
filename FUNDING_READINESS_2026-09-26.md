# Funding & Production Readiness — 2026-09-26

This is the canonical execution plan for FactLedger. It is intentionally evidence-based: do not claim users, revenue, integrations, production payment processing, or protocol verification unless the repository or production environment proves it.

## Canonical project
- Repository: https://github.com/fas988840-dev/FactLedger
- API: https://factledger-api.onrender.com
- Stage: developer preview until the production gates below pass.
- Historical references to `fas988840-dev/PROJECT-x` are legacy only and must not be used in new applications.

## Priority 0 — submission integrity
- [ ] Replace legacy PROJECT-x links in current grant/funding application material.
- [ ] Keep historical submitted snapshots intact when changing them would falsify what was originally submitted; mark them as historical instead.
- [ ] Use one current product description, one canonical demo URL, and one canonical repository URL.
- [ ] Never claim customers, revenue, partnerships, awards, or production payment processing without evidence.

## Priority 1 — production reliability
- [ ] Keep CI, type-check, lint, tests, build, and CodeQL green.
- [ ] Complete a live production verification run against the release commit.
- [ ] Verify dedicated Solana RPC configuration and WebSocket behavior.
- [ ] Finish Pyth production credentials/feed verification or explicitly exclude Pyth from the release scope.
- [ ] Verify exact production CORS allowlist, API-key enforcement, rollback procedure, and secret handling.
- [ ] Add request/error/latency observability without logging credentials.

## Priority 2 — payments and commercial readiness
Payment work already exists on separate branches. Do not advertise checkout as live until one path passes end-to-end sandbox verification.

Target architecture:
1. Server creates an immutable order for a known plan.
2. Payment provider checkout is initiated server-side.
3. Callback/webhook signature is verified from the raw request body where required.
4. Server reconciles payment status with the provider; client redirects are never treated as proof of payment.
5. Payment/event processing is idempotent.
6. Subscription entitlement is stored durably.
7. Customer API keys are provisioned/rotated/revoked server-side.
8. Usage and plan limits are enforced server-side.
9. Secrets exist only in the deployment secret store.
10. Refund/cancellation/renewal state is represented explicitly.

Existing work to review before integration:
- `billing/subscription-catalog-2026-09-24`
- `billing/paytabs-sandbox-verification-2026-09-23`
- `billing/moyasar-test-adapter-2026-09-24`
- `billing/tap-paid-api-subscriptions-2026-09-25`

Do not merge multiple gateways merely to look complete. Choose one provider after merchant approval and sandbox E2E evidence; keep other adapters experimental.

## Priority 3 — external usage proof
- [ ] Recruit at least 3 external developers/design partners.
- [ ] Record reproducible API/MCP usage evidence.
- [ ] Obtain permission for named references, otherwise report only truthful anonymous counts.
- [ ] Track activation: API key issued -> first successful analysis -> repeat usage.
- [ ] Record product feedback and resulting changes.

## Priority 4 — grant/hackathon package
For each application provide:
- one-sentence problem/solution;
- live demo;
- canonical GitHub repository;
- architecture diagram;
- exact Solana dependency/integration;
- reproducible technical proof;
- founder role and execution history;
- traction evidence (or explicitly “no verified external users yet”);
- business model and pricing hypothesis;
- milestone-based use of funds;
- 90–180 second product demo;
- current limitations and next milestones.

## Crypto World's Fair target
Current official deadline: 2026-10-12.
Target track: Solana Ecosystem.

Submission gate:
- [ ] Product is accessible to judges.
- [ ] Demo works without private founder-only setup.
- [ ] Current repository link is used everywhere.
- [ ] Solana integration is visible and material.
- [ ] Payment status is described accurately.
- [ ] At least one external-user proof is preferred before submission.
- [ ] Video demonstrates the product rather than slides.
- [ ] README has a reviewer-oriented five-minute verification path.

## Funding narrative
FactLedger is an evidence-first, read-only Solana intelligence layer that turns wallet and transaction activity into attributable evidence, deterministic risk context, and machine-readable outputs for developers and agents.

The funding case should be based on execution and verifiable milestones, not speculative metrics.

### Suggested milestone use of capital
1. Production RPC/reliability and observability.
2. Evidence/protocol verification depth.
3. Secure commercial access and payment/subscription infrastructure.
4. External developer onboarding and integrations.
5. Security hardening and release validation.

## Release decision
Do not label FactLedger v1.0 or “production payment ready” until the corresponding gates are evidenced. A smaller truthful developer preview is stronger for diligence than inflated claims.

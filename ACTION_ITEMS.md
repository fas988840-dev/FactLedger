# FactLedger — Current Action Items

Updated: 2026-09-16

This file replaces the older pre-deployment checklist. It reflects the canonical repository and current production-readiness work.

## Completed / verified

- [x] Canonical public repository: `https://github.com/fas988840-dev/FactLedger`.
- [x] Repository rename completed and the canonical link verified through the
  GitHub repository API on 2026-09-16.
- [x] Active `Protect main` ruleset blocks deletion and force-push updates and
  requires both API and dashboard CI checks.
- [x] Public API deployment: `https://factledger-api.onrender.com`
- [x] Render deployed commit `90ea95ceba394b337441e0cb0ec902031e234971` successfully.
- [x] Production `/api/v1/health` returned HTTP 200 with the price dependency operational.
- [x] Production API-key enforcement is active; protected routes reject requests without a valid key.
- [x] CI and CodeQL configured.
- [x] Dependabot breaking major updates for ESLint and TypeScript are blocked pending review.
- [x] Merged Pyth REST/MCP integration with explicit feed mapping and UNKNOWN/null fallback.
- [x] Live verification workflow exists for production smoke testing.
- [x] Security policy/threat-model hardening is tracked in `SECURITY.md`.
- [x] OpenAPI entry point is tracked in `docs/openapi.yaml`.
- [x] Release gates are tracked in `PRODUCTION_READINESS.md`.
- [x] Grant/application status is tracked under `GRANTS/`; do not duplicate already submitted applications without a reason.
- [x] A truthful progress update was sent on 2026-09-16 as a reply to the
  existing 2026-09-10 Solana Grants confirmation thread.

## External/account-controlled blockers

- [ ] Obtain a real Pyth API key through the founder's Pyth account.
- [ ] Verify production mint→USD feed IDs against Pyth's official feed catalog.
- [ ] Store Pyth credentials/feed mapping in production secrets and run `scripts/verify-pyth.ts` against the real account.
- [ ] After Pyth activation, re-deploy and verify `/api/v1/health` with Pyth selected; the current operational price provider is not evidence that Pyth is active.
- [ ] Verify production `CORS_ORIGIN`, dedicated `SOLANA_RPC_URL`, and Pyth variables in the host secret store. `NODE_ENV=production` is set by the image and API-key enforcement is visibly active, but secret values must remain undisclosed.
- [ ] Ensure the GitHub live-verification workflow has `FACTLEDGER_API_URL` and any required API key secret.
- [ ] Run the credentialed live-verification workflow. Anonymous production
  checks currently verify health and auth rejection only; protected endpoint
  behavior must be exercised through the stored secret, not by exposing it.
- [ ] Add the pull-request requirement to `Protect main` and verify that the
  ruleset API contains a `pull_request` rule. The current active ruleset does
  not yet report that rule, so it must not be represented as enabled.
- [ ] Link a real Vercel team/project if the dashboard is to be deployed on Vercel. The current connected Vercel integration exposes no team/project.
- [ ] Recruit and verify first external developers/integrations; do not claim MAU, revenue, customers, TVL, or adoption before evidence exists.

## v1.0 release gate

Do not tag v1.0 until `PRODUCTION_READINESS.md` is satisfied or any deliberately excluded capability is documented as out of scope. At minimum, CI/CodeQL and the live production verification must pass on the release commit, production secrets must be configured, rollback must be known, and security/API documentation must be current.

## Next execution order

1. Merge this documentation hardening only after CI passes.
2. Complete founder-controlled Pyth credentials/feed verification.
3. Run production live verification against Render.
4. Link/deploy the dashboard on Vercel if Vercel is still the desired frontend host.
5. Run full end-to-end dashboard → API → Solana/Pyth verification.
6. Obtain external-user proof.
7. Cut v1.0 only when the release gate is satisfied.

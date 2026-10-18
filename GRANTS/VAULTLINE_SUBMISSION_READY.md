# Vaultline Security Audit Grant — 100% Ready Submission Pack

Prepared 2026-10-18 · Listing: https://superteam.fun/earn/listing/vaultline-security-audit-grants-for-colosseum-projects-up-to-4000-usdc-each/
Deadline: **31 Oct 2026** · Winners: 2 Nov 2026

## Reality of the prize (read first)
- Up to 4,000 USDC **in audit services, in-kind only — "not paid out as cash"**, non-transferable.
- Value to FactLedger: an independent audit report we can show to grant committees, buyers and
  enterprise report clients. It is credibility capital, **not wallet income** and not part of the
  $10K/15-day cash target except as trust collateral.

## Their conditions → our status
| Condition (from listing) | Status |
|---|---|
| Colosseum hackathon participation | ⚠️ NOT VERIFIED — eligibility inquiry sent to support@vaultline.co on 2026-10-18 (msg `1a14cd7d014fcabf`), awaiting reply |
| Solana programs (Anchor/native) in scope | ⚠️ We have NO on-chain program — honest scope below; do not misrepresent |
| Public repo access for auditors | ✅ Public: https://github.com/fas988840-dev/FactLedger |
| Codebase size disclosed | ✅ 5,352 LOC production TypeScript in `src/` (+21 test files, 224 tests) |
| Working product / live deployment | ✅ Demo https://factledger-demo.onrender.com/demo.html · API `/api/v1/health` 200 |
| Contactable team | ✅ Abdullah Al-Anzi, fas988840@gmail.com, Riyadh |

## Honest audit scope we request (if they accept off-chain scope)
Priority order for the auditor:
1. `src/services/token-security-verifier.ts` + `evidence-graph.ts` — correctness of security claims
   shown to users/agents; no fabricated values (null/UNKNOWN discipline).
2. `src/services/micropayment-verifier.ts` — payment-proof verification logic.
3. `src/api/server.ts` (910 LOC) — auth (X-API-Key), rate limits, CORS allowlist, input validation.
4. `src/mcp/server.ts` (208 LOC) — 8-tool MCP surface consumed by AI agents.
5. `src/services/pyth-hermes-price-provider.ts` — feed mapping, staleness, timeout handling.

Out of scope honestly declared: no Anchor/native program, no custody, no signing, no private keys
handled anywhere (read-only by design — see SECURITY.md threat model).

## Paste-ready answers
- **Project:** FactLedger — open-source, read-only Solana wallet-intelligence platform (REST API +
  8-tool MCP server for AI agents). Deterministic and evidence-based; unknown values are returned
  as `null`/`UNKNOWN`, never fabricated. Approved on Glama as `factledger-mcp` (2026-10-18).
- **Repository:** https://github.com/fas988840-dev/FactLedger (MIT)
- **Lines of code:** ~5,352 production TypeScript LOC in `src/` (8,939 incl. tests), 224 tests passing.
- **Stage:** Live mainnet-facing read-only service on Render; demo + API health links above.
- **Why audit now:** Our token-security verdicts are consumed by AI agents and reviewers as
  evidence; independent review of the verifier + evidence pipeline validates exactly those claims.
- **Remediation commitment:** Solo founder commits to fixing Critical/High findings within
  14 days of report delivery and requesting the included remediation re-check; fixes land on
  `main` behind the existing CI + CodeQL gates.
- **Contact:** Abdullah Al-Anzi, fas988840@gmail.com

## Blockers that are NOT in our control (do not fake these)
1. If Colosseum participation is a hard requirement and we have no verified submission → ineligible.
2. If scope is strictly Anchor/native programs → ineligible.
Either answer from Vaultline closes this track honestly; the submission above is ready to send
the same day a "yes" arrives (requires founder's logged-in Superteam account, ~2 minutes).

## Sponsors-review status (GitHub) — what "fixing" can and cannot do
- Profile submitted 13 Oct 2026; public page still 302 = under GitHub staff review.
- Everything on our side is verified complete: `.github/FUNDING.yml` live on `main`, tiers set
  ($5/mo, $10 one-time), W-8 + Stripe submitted (GitHub emails on file), Sponsor button routes to
  FUNDING/DONATE.md where the direct Solana route needs no approval and is open today.
- Approval timing is GitHub-staff-only; nobody outside GitHub can expedite it. Daily workflow
  monitor re-checks the page every morning and will flag the day it flips to 200.

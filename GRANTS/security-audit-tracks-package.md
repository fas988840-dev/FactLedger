# FactLedger — Security Audit Tracks Submission Package (Oct 2026)

Prepared 2026-10-18. Canonical links for every answer below:
- Repo: https://github.com/fas988840-dev/FactLedger (releases v0.1.0, v0.1.1)
- Live demo: https://factledger-demo.onrender.com/demo.html
- API health: https://factledger-api.onrender.com/api/v1/health
- MCP: approved on Glama as `factledger-mcp` (2026-10-18); `glama.json` + `smithery.yaml` in repo
- Contact: Abdullah Al-Anzi, Riyadh — fas988840@gmail.com
- Codebase: TypeScript, ~8,939 LOC in `src/` (21 test suites, 224 passing tests via `npm test`)

## Track A — Adevar Labs "$20,000 in Pre-Audit Credits" (Superteam Earn)
- Listing: https://superteam.fun/earn/listing/pre-audit-credits-adevarlabs
- **Status verified 2026-10-18: CLOSED 12 Oct 2026, 112 submissions, winners announced ~27 Oct 2026.**
- **Nature of prize (verbatim from listing):** "$4,000 pre-audit value each across 5 teams… in-kind service only (no cash alternative)", non-transferable, redeemable 6 months.
- Eligibility: must have submitted to Colosseum Crypto World's Fair; Solana/Rust only. ⚠️ FactLedger is TypeScript (no on-chain Rust program) and its Colosseum Crypto World's Fair submission is NOT verified — treat this track as closed/ineligible unless the sponsor confirms otherwise (contact: t.me/ostanescu).
- Suggested tweet (if a late/next round opens): "Just submitted our project to the @AdevarLabs Security Sidetrack on @superteamearn for @Colosseum's Crypto World's Fair Hackathon. Excited for the chance to receive a full security Pre-Audit for our project. https://github.com/fas988840-dev/FactLedger"

## Track B — Vaultline Security Audit Grants (up to 4,000 USDC each ×10)
- Listing: https://superteam.fun/earn/listing/vaultline-security-audit-grants-for-colosseum-projects-up-to-4000-usdc-each
- **Status verified 2026-10-18: Submissions OPEN, closes 31 Oct 2026, winners 2 Nov 2026.**
- **Nature of prize (verbatim):** "worth up to 4,000 USDC in audit services… It is not paid out as cash."
- Scope note: "Solana programs (Anchor or native) are in scope." ⚠️ FactLedger has no Anchor/native program — its surface is a read-only TypeScript API/MCP server. Apply only with honest framing (API/MCP codebase audit-readiness) and confirm scope with sponsor first (contact: t.me/DevonMartens).
- Required answers (ready to paste):
  - **Project:** FactLedger — open-source, read-only Solana wallet-intelligence platform (REST API + 8-tool MCP server for AI agents). Deterministic, evidence-based; unknown values stay `null` (never fabricated).
  - **Repository & scope requested:** https://github.com/fas988840-dev/FactLedger — `src/api`, `src/mcp`, `src/services` (token-security verifier, evidence engine, micropayment verifier).
  - **LOC:** ~8,939 lines of TypeScript in `src/` (plus 21 test files).
  - **Stage:** mainnet-facing read-only service, live on Render (demo + API above); no user funds are ever held or signed for (read-only by design — no private keys, no signing).
  - **Why an audit now:** FactLedger's output is consumed by AI agents and grant/buyer reviewers as security evidence about wallets/tokens; an independent review of our token-security verifier and evidence pipeline directly validates the claims our users rely on. Approved on Glama (factledger-mcp) 2026-10-18.
  - **Team contact:** Abdullah Al-Anzi (solo founder), Riyadh, fas988840@gmail.com.

## Cash reality check (for the founder)
Neither track pays cash to the wallet (`5V58c59zzfx5AjfjDwiQSMqK1FoQ8xvtbRnCjmHocmQG`). Both pay **audit services in kind**. Cash routes remain: Superteam microgrant (4,000–10,000 USDC, applied + demo update sent 2026-10-18), Giveth donations, GitHub Sponsors (pending GitHub staff approval; direct Solana donations already open via FUNDING/DONATE.md), and the Acquire.com sale ($24,500 asking, $0 TTM).

# Vaultline Security Audit Grants (up to 4,000 USDC each) — Eligibility & Verification Data

**Verified:** 2026-10-13 against the live Superteam Earn listing and this repository.
**Verdict: NOT ELIGIBLE today — do not submit.**

## Why not

The listing's scope is explicit: *"Solana programs (Anchor or native) are in scope"* and applicants must name *"the specific programs to be audited."* FactLedger contains **no on-chain program**: the repository has no `.rs` files, no `Anchor.toml`, no `Cargo.toml`, and no program ID it controls. Its `src/services/dex-registry.ts` only holds third-party program IDs (Jupiter, Orca, Raydium) for read-only parsing.

Also note what the award is: **up to 4,000 USDC in audit services applied to a Vaultline audit — not a cash payout.**

Submitting an out-of-scope application is not free: on 2026-09-22 a Superteam Earn submission from this account was reported as spam and one submission credit was deducted. A second flag would damage the account's standing with the same platform that hosts the listings worth applying to.

## Listing facts (fetched 2026-10-13)

- 10 audit grants, each up to 4,000 USDC in Vaultline audit services.
- Applications close **2026-10-31**; selected projects announced **2026-11-02**.
- Requires a Colosseum submission link, a repository Vaultline can access, approximate lines of code, current stage (devnet/testnet/mainnet), user or TVL figures, and a team contact.
- Contact for questions: `t.me/DevonMartens`.

## Field-by-field answers (on record, in case the scope ever changes)

| Required field | Honest answer today |
| --- | --- |
| Project name | FactLedger |
| Short description | MIT-licensed, read-only Solana wallet intelligence API with REST and MCP interfaces; verified evidence or `null`, never estimated values |
| Colosseum submission link | **None — no Colosseum submission exists** |
| Repository | https://github.com/fas988840-dev/FactLedger |
| Specific programs to audit | **None — no Solana program in the repository** |
| Approximate lines of code | 5,288 non-test TypeScript lines in `src/` (8,855 lines across `src/` including 3,567 test lines; 21 test files, 223 tests passing) |
| Current stage | Deployed read-only **API** (mainnet data via public RPC); not an on-chain program. No devnet/testnet program deployment exists |
| Users / TVL | 0 users, no TVL — never claim otherwise |
| Why an audit matters now | Not applicable to the on-chain scope. The API surface is already gated by 223 automated tests, a lint/type-check/build pipeline, and an `npm audit --audit-level=high` gate |
| Team contact | fas988840@gmail.com |

## When this becomes a real opportunity

If FactLedger ever ships an on-chain component (for example, an Anchor program that anchors evidence commitments or verifies scores), this grant becomes a strong fit and the Colosseum requirement should be satisfied first by entering a Colosseum hackathon with that program. Until then, the honest routes are the ones in `GRANTS/ROUTES-AND-DONATIONS-2026-10-13.md`.

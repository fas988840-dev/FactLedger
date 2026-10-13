# FactLedger — Funding & Donation Routes, researched 2026-10-13

Every route below was checked on 2026-10-13. Each entry states what it pays, what it requires, and whether the honest FactLedger state (0 users, 0 revenue, solo, no registered company, MIT licence, deployed read-only API) actually qualifies. Nothing here is claimed as submitted or won.

## 1. Grants that fit the current state

### Superteam Earn microgrants — best current match
- **What:** equity-free microgrants, commonly $200–$10,000, quick turnaround (marketed as roughly 48 hours' decision).
- **Why it fits:** Superteam has a **MENA chapter** and an active Saudi programme — Alex Scott leads Superteam MENA, and Superteam partnered with dropp on Web3 adoption for Vision 2030. Riyadh-based solo builders are inside the target region, unlike the emerging-market lists quoted in older Solana Foundation referrals.
- **What is required:** a talent profile on `earn.superteam.fun`, a short project overview, measurable milestones, and a budget.
- **Caveat:** the account already carries one spam flag from 2026-09-22. Read each listing's scope before submitting; only apply where the scope matches exactly.
- **Action:** create/polish the talent profile, then apply to live Global or MENA listings whose scope matches wallet-intelligence or developer tooling.

### SafePal Solana Builders Grant — strong programme, weak current match
- **What:** a $3M initiative across 2026 (funds plus growth/marketing resources).
- **Criteria:** time live, monthly active users, TVL, community size and engagement, ecosystem contributions.
- **Honest position:** FactLedger has no users and no TVL, so it would be scored near the bottom today.
- **Action:** a draft already exists at `GRANTS/safepal-solana-growth-grant-2026-09-06.md`. Hold it until there is either usage data or a conformance/listing milestone to report; then apply with numbers instead of promises.

### Colosseum (hackathons and accelerator) — the route the Solana Foundation itself recommended
- **What:** non-dilutive prize pools; selected winners are considered for a $250k pre-seed accelerator.
- **Requirement:** a Colosseum submission — which also unlocks the Vaultline audit grant route if FactLedger ever ships an on-chain program.
- **Action:** the existing Colosseum Eternal work in `GRANTS/colosseum-eternal-grant.md` is the natural vehicle.

### Gitcoin grants rounds — verify the current cycle before relying on it
- **What:** quadratic funding where small donations are matched from a pool (GG24's OSS QF pool was $200k+; some rounds ran $1M+ across domains such as Dev Tooling).
- **Requirement:** applications through the round's platform (recent rounds run on Giveth) inside a short window; the Dev Tooling domain is the relevant one.
- **Caution:** the cycle dates are the whole game. The GG24 QF window was 14–28 October with applications due 17 October in that year. Whether an equivalent 2026 cycle is open now must be confirmed on the official Gitcoin/Giveth pages before planning around it. Gitcoin rounds are also Ethereum-ecosystem-weighted, so a Solana-only tool must fit the domain's stated scope.

### Not recommended right now
- **Solana Foundation grants:** declined 2026-09-20 ("not quite far enough along"). Re-apply only after a material change (usage, an on-chain component, or a Colosseum result), never as a duplicate.
- **Kraken developer grants:** request open since 2026-09-06 with no reply; the published programme skews to Bitcoin/Ethereum/Lightning/Monero/Rust rather than Solana data tooling. Leave the follow-up to November 2026.
- **Vaultline 4,000 USDC audit grants:** out of scope — see `GRANTS/vaultline-4000-verification-2026-10-13.md`.

## 2. Donations — what is now enabled in this repository

### GitHub Sponsors — primary route
- Profile submitted 2026-10-13 and under review.
- **Outstanding step:** confirm the email on the Stripe Express account (link in the Stripe email dated 2026-10-13). Payouts cannot flow until that is done.
- `FUNDING.yml` is now committed, so the Sponsor button appears once the profile is approved.

### Direct crypto — zero-fee, available today
- USDC on Solana, single canonical address in `FUNDING/RECEIVING_WALLET.md`, summarised in `FUNDING/DONATE.md`.
- No platform approval, no country restrictions, no fees beyond network cost.

### Platforms worth adding later (not enabled yet)
| Platform | Platform fee | Notes |
| --- | --- | --- |
| Ko-fi | 0% one-time | No approval process; useful for non-GitHub supporters |
| Buy Me a Coffee | ~5% | Simple tipping, wide audience |
| Polar.sh | ~5% | Built for developers; supports issue funding |
| Open Collective | 5–10% | Transparent budgeting; needs a fiscal host |
| Liberapay | 0% | EU-focused recurring donations |
| thanks.dev | 0% | Passive income only if other projects depend on this work |
| donatr.ee | 0% | Aggregator page that can include the Solana wallet |

### What actually moves the needle for donations
Sponsors fund projects they can see working. The highest-value, zero-cost actions are the ones already identified in `GRANTS/STATUS-2026-10-13.md`: a public email and bio on the GitHub profile, private-contribution display, and the repository description/homepage/topics. Those are one click each in the browser.

## 3. Suggested order of operations

1. Confirm the Stripe email → GitHub Sponsors goes live (donations start).
2. Land the Colosseum submission → unlocks prize pools and, later, audit-grant eligibility.
3. Apply to matching Superteam MENA/Global listings with scope-accurate answers.
4. Revisit SafePal once there is usage evidence, and Kraken in November 2026.

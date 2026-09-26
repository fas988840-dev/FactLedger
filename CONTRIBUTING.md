# Contributing to FactLedger

FactLedger is a read-only Solana wallet-intelligence project. Contributions are welcome when they preserve the project's core invariants: reproducible outputs, evidence-backed findings, explicit UNKNOWN/null states, and no custody or transaction signing.

## Development setup

Requirements:

- Node.js 20+ for the dashboard
- Node.js 18+ for the API package
- npm

Clone and install:

```bash
git clone https://github.com/fas988840-dev/FactLedger.git
cd FactLedger
npm ci
cp .env.example .env.local
```

For the dashboard:

```bash
cd dashboard
npm ci
cp .env.example .env.local
npm run dev
```

Never commit real credentials, API keys, wallet secrets, seed phrases, payment credentials, or private RPC tokens.

## Validation before opening a pull request

Run the root checks:

```bash
npm run lint
npm run type-check
npm test
npm run build
```

Run the dashboard checks:

```bash
cd dashboard
npm run lint
npm run build
```

A change is not ready to merge if it weakens deterministic behavior, silently fills missing evidence, or breaks the read-only boundary.

## Data-integrity rules

Contributions must preserve these rules:

- Unknown information stays `UNKNOWN` or `null`.
- Do not invent signatures, slots, mints, program IDs, prices, confidence values, customers, revenue, MAU, or production status.
- Evidence-backed findings should cite the on-chain source that supports them.
- Candidate protocol decoding must not be presented as confirmed until account-layout decoding is verified.
- Repeated analysis of the same examined evidence must remain deterministic.

## Security

Read [SECURITY.md](SECURITY.md) before changing authentication, CORS, rate limits, deployment settings, external providers, or secret handling.

Do not open public issues containing credentials or sensitive deployment values. Security reports should follow the private reporting path documented in SECURITY.md.

## Pull requests

Keep pull requests focused and explain:

1. what changed;
2. why it changed;
3. how it was tested;
4. any production or data-integrity risk;
5. rollback considerations when the change affects deployment or external providers.

Prefer a pull request over direct changes to `main`.

## Production claims

FactLedger is currently a developer preview. Do not describe the project as v1.0-ready, fully production-ready, revenue-generating, or externally adopted unless the repository contains current evidence supporting that claim.

Deployment, Pyth, dashboard, payment, grant, and traction claims must match the evidence in the repository and live services.

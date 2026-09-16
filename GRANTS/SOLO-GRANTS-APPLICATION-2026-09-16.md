# FactLedger — Solo Grants application

Prepared: 2026-09-16  
Official form: https://airtable.com/appHaOk5VRk50CpcF/pag93ybs2R8OfxZXD/form  
Status: **ready except for founder-only financial-need answers; not submitted**

## Verified applicant fields

- First name: Abdullah
- Last name: Al-Anzi
- Email: fas988840@gmail.com
- Phone: +966532331116
- City/Country: Riyadh, Saudi Arabia
- Building solo: Yes
- Representative link: https://github.com/fas988840-dev/FactLedger

## Project fields

### One-liner

FactLedger is an open-source Solana wallet-intelligence API that produces reproducible risk analysis with transaction-cited evidence instead of guessed data.

### Amount requested

$1,000

### Budget breakdown

- $500 — dedicated Solana RPC and WebSocket usage for sustained live-alert and reliability testing.
- $250 — production monitoring, logs and uptime measurement during the benchmark period.
- $150 — reproducible load, failure-mode and provider-comparison benchmark runs.
- $100 — public verification artifacts, integration examples and demo/documentation hosting.

### Share what you're working on

I am Abdullah Al-Anzi, a solo developer in Riyadh building FactLedger, an open-source, read-only Solana wallet-intelligence API. Wallet-risk products often return precise-looking scores without showing which transactions produced them or which facts were unavailable. FactLedger takes an evidence-first approach: supported findings cite the underlying transaction data, deterministic scores can be recomputed, and values that cannot be verified remain null or UNKNOWN rather than being invented.

The MVP is already public and MIT licensed. It includes a REST API, MCP tools for AI clients, deterministic wallet intelligence and risk analysis, transaction evidence output, automated tests, CI and a live Render deployment. The project never requests private keys, never stores seed phrases and never signs transactions. I do not claim users, revenue, funding or awards without evidence.

The remaining gap is a measurable production-reliability pass. Free public Solana RPC endpoints are useful for development but are not sufficient evidence for sustained WebSocket subscriptions, repeatable benchmarks or controlled failure testing. This grant would fund dedicated RPC/WebSocket usage, monitoring and reproducible benchmark runs. I will publish the non-secret methodology and results in the repository, validate live alert delivery against a dedicated provider, and improve the integration examples so another developer can independently reproduce the results.

Project proof:

- Source: https://github.com/fas988840-dev/FactLedger
- Live API: https://factledger-api.onrender.com
- Demo: https://factledger-demo.onrender.com/demo.html

## Founder-only fields required by the form

These answers are intentionally blank because they contain personal financial and household information that is not documented and must not be inferred.

- Current financial situation, challenges/unexpected expenses, and how the grant would help.
- Relevant personal or family circumstances.
- Alternative funding route if the grant is not received.
- Employment status.
- Number of dependents.
- Single- or dual-income household.
- Number of people living in the home.

## Submission rule

Do not click **Apply** until the founder has supplied the missing truthful answers and confirms transmission of the contact, financial and household data to Solo Grants/Airtable.

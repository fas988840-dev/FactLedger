# Dependency and build repair — 2026-10-19

## Changes

- Keep `@solana/web3.js` at the existing resolved 1.99.0; scope an npm override to its `jayson` dependency, pinned to 5.0.0.
- Jayson 5 removes `uuid` and `stream-json`, eliminating the four moderate audit findings without forcing web3.js 3.x. Its documented breaking change concerns TCP/TLS delimiter framing. Web3.js uses `jayson/lib/client/browser` for HTTP JSON-RPC, not those TCP/TLS transports. WebSocket transport remains `rpc-websockets`.
- Add two regression tests exercising the actual Connection HTTP serialization/result decoding and JSON-RPC errors with a supplied fetch transport (no live RPC required).
- Align Docker build/runtime, CI and package engine with Node 22 (minimum 22.12.0). Previously Docker/CI used Node 20 despite Vitest 5 requiring Node >=22.12.0. This is a confirmed configuration mismatch, not a proven cause of the historical Render failure.

## Verified locally

- Clean `npm ci`, lint (no warnings), type-check and TypeScript build pass.
- 226 tests pass across 22 files, including the two new compatibility tests.
- Both `npm audit` and `npm audit --omit=dev` report zero vulnerabilities at review time.
- Separate production-only clean install and web3.js import/Connection construction succeed.
- `git diff --check` passes.

## Render investigation and limits

GitHub's jobs API confirms historical CI run `39193399500` for commit `377ff9867c358ea8a9f9762bd2d33651b2582bb8` failed in **Lint**; the dashboard job succeeded. Full archived logs could not be retrieved because their download host is inaccessible from this environment. This CI result does not establish why Render's separate build exited 1.

Docker is not installed in this environment, so the image itself has not been built here. Production install and compilation were exercised separately. Render logs/account access are still needed to establish the original deployment failure and confirm a new deployment.

The changes remain on the Arena working branch; no production deployment or successful live health check is claimed. After review/merge, let Render build the new commit, inspect its build logs and verify `/api/v1/health` and protected-route rejection. Do not expose API keys in logs or chat.

## Follow-up: dashboard and startup logging

A separate dashboard audit found nine findings (eight high, one critical). The earlier clean audit was for the root API package, not the dashboard. Updated the dashboard lockfile and minimum Next.js/eslint-config-next versions to 16.4.2; resolved sharp is 0.35.5 and source-map-js is 1.2.2. Dashboard production audit now reports zero findings. The full dashboard audit still reports five high development-tool findings through eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces. The latest published braces is 3.0.3 and remains affected; npm proposes a breaking downgrade to eslint-config-next 14.2.35. No forced downgrade, advisory suppression or lint removal was applied. Avoid running lint on untrusted repositories/patterns and re-evaluate when upstream patches are published.

Removed startup logging of the Solana RPC URL: provider credentials may appear in its path, query or userinfo. Logs now state that the endpoint is configured without printing it. This change addresses that specific startup leak, not a claim that all logging paths have undergone a full secret-handling audit.

Revalidation: clean installs for both packages; root lint/type-check/build and all 226 tests pass; root full and production audits are clean; dashboard lint and Next.js production build pass and production audit is clean. Full dashboard audit remains five high / zero critical as described above. Production Render deployment is still not verified.

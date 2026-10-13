# Vercel dashboard — decision and exact steps (2026-10-13)

## Current facts

| Signal | Value |
| --- | --- |
| GitHub deployments from `vercel[bot]` | Ten, all dated 2026-09-01; nothing since |
| Vercel git-integration deployments (Preview/Production) | Failed on 2026-09-01/02 — this is what the red Production/Preview badges in the repository sidebar show |
| `deploy-dashboard.yml` (Actions) | Last run #9 on 2026-09-27: success, including an HTTP 200 smoke test at the URL it created |
| Stable alias `x-abdulah1.vercel.app` | `404 DEPLOYMENT_NOT_FOUND` when checked on 2026-10-13 |
| Dashboard URL recorded in the repository | None — `DEPLOYMENT.md` and `fly.toml` contain placeholders only |

Net effect: the dashboard has no verifiable public URL, while the API and the reviewer demo on Render are live and verified (see `GRANTS/STATUS-2026-10-13.md`). The red Vercel badges are the only public "failure" signal on the repository, and they are attached to a surface that no grant application currently cites.

## Option A — repair and pin (choose this only if the dashboard is part of the story you tell funders)

1. Vercel dashboard → the project → **Settings → Git** → reconnect the repository and confirm the production branch is `main`.
2. Vercel dashboard → **Settings → Domains** → assign a stable domain (for example `factledger-dashboard.vercel.app`) instead of relying on per-deployment URLs. Per-deployment URLs are immutable and expire; they are not something to cite in an application.
3. Fix the build that failed on 2026-09-01: open the failed deployment's build log and resolve the error (the commit history around that date is titled "fix: correct why Vercel build failed", so the fix likely landed but was never re-verified on Vercel).
4. Re-run `deploy-dashboard.yml` from the Actions tab (workflow_dispatch), then confirm the smoke test passes and record the stable URL in `DEPLOYMENT.md`.
5. Only after step 4: reference the dashboard URL in grant material.

## Option B — disconnect (choose this if the API plus the Render demo is the whole product story)

1. Vercel dashboard → the project → **Settings → Git** → disconnect the repository. This stops Vercel from creating deployment records and stops the red badges.
2. Optionally delete the Vercel project entirely if the dashboard work has moved to Render.
3. GitHub repository → **Environments** → delete the stale `Production` and `Preview` environments if they stay behind after disconnecting.
4. Keep `deploy-dashboard.yml` in the repository (it is dispatch-only in practice) or remove it if the dashboard is truly abandoned — an unused deploy workflow that has never been re-run is itself a small credibility cost.

## Recommendation

**Option B, temporarily.** FactLedger's verifiable public surfaces are the API and the live demo on Render, both confirmed healthy on 2026-10-13. The dashboard is not cited by any current application, so keeping a failed deployment pipeline visible costs more than it returns. If a dashboard becomes part of a pitch, do Option A completely — including the stable domain — before citing it anywhere.

Neither option can be executed from this session: the GitHub App token lacks administration scope (HTTP 403), and the Vercel project itself is outside this repository's control.

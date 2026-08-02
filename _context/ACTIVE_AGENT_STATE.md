# Active agent state

## Gallery refinement release (2026-08-01)

- Public Gallery refinement commits are pushed on `feat/full-site-overhaul`: `276cc9d` adds optional placards and editable layout suggestions; `dc321dc` makes placards subtler, adds 85%-130% zoom, hides number bubbles when placards are visible, and makes layout suggestions respect each photographic environment's usable area.
- Vercel production deployment `dpl_D3oM36F5o3W4ZtGJpKHPLEcizzXS` is Ready and aliased to `https://www.jwsfineart.com`.
- Production wall data is live: Across the West was redesigned with six hand-placed works and placards (draft/published revision 6); Coastal Light keeps every piece above the bench/floor area and its leftmost piece was moved to x=30 so its placard is fully visible on mobile (draft/published revision 6).
- Live browser QA passed at desktop and 390px mobile: all five walls have no horizontal overflow, no clipped placards, and no number bubbles while placards are enabled; zoom/reset, wall navigation, artwork detail dialog focus/close, and Explore Every Work passed; browser warnings/errors were empty.
- QA artifacts: `gallery-across-the-west-desktop`, `gallery-coastal-light-desktop`, and `gallery-coastal-light-mobile`. `agent-artifacts validate` passes.
- Verification: typecheck, lint, full 140-test suite, targeted gallery suggestion tests (3), and Vercel's Node 24 production build pass. Per project policy, no local production build was run.

- Objective: release the approved viewing-room, framed-dimensions, media-rail, crop, and site-remediation implementation; create production walls and capture QA screenshots.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Verification: 135 tests pass; TypeScript passes; ESLint passes. Local Next Turbopack build hangs without an error under both Node 22 and required Node 24; Vercel production build remains the authoritative build gate.
- Implemented: framed estimates/verification queue/migration/audit, unified artwork attention counts, presentation crop metadata/editor/edge scan, room visualization media item, curated viewing-room schema/owner manager/public routes/analytics/health, Work filters, aliases, slideshow redirect, shipping finished-size policy behind a disabled approval flag.
- Owner policies: Stripe Tax disabled; listed prices include tax; Clerk remains admin-only.
- Framed estimate v1: add 1.5 inches per side, round to 0.25 inches, mark unverified.
- Production gate: do not set `JWS_USE_FINISHED_SHIPPING_DIMENSIONS=true` until Jill approves the generated tier-impact report. Current collector charges stay unchanged.
- Release sequence now authorized: production Convex export, Convex deploy, idempotent migrations, commit/push, Vercel production deploy, browser QA, create/publish test walls, capture screenshots.

# Active agent state

- Objective: release the approved viewing-room, framed-dimensions, media-rail, crop, and site-remediation implementation; create production walls and capture QA screenshots.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Verification: 135 tests pass; TypeScript passes; ESLint passes. Local Next Turbopack build hangs without an error under both Node 22 and required Node 24; Vercel production build remains the authoritative build gate.
- Implemented: framed estimates/verification queue/migration/audit, unified artwork attention counts, presentation crop metadata/editor/edge scan, room visualization media item, curated viewing-room schema/owner manager/public routes/analytics/health, Work filters, aliases, slideshow redirect, shipping finished-size policy behind a disabled approval flag.
- Owner policies: Stripe Tax disabled; listed prices include tax; Clerk remains admin-only.
- Framed estimate v1: add 1.5 inches per side, round to 0.25 inches, mark unverified.
- Production gate: do not set `JWS_USE_FINISHED_SHIPPING_DIMENSIONS=true` until Jill approves the generated tier-impact report. Current collector charges stay unchanged.
- Release sequence now authorized: production Convex export, Convex deploy, idempotent migrations, commit/push, Vercel production deploy, browser QA, create/publish test walls, capture screenshots.

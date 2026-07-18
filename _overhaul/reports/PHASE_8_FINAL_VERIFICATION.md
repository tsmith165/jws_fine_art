# Phase 8 Final Branch Verification

## Release Candidate

- Branch: `feat/full-site-overhaul`
- Draft PR: `https://github.com/tsmith165/jws_fine_art/pull/56`
- Verified preview: `https://jwsfineart-ollwousi8-tsmith-hobby.vercel.app`
- Vercel deployment: `dpl_Hyrr6AUSaTdPZV7zsNNomcFXCpGp`
- Verified implementation commit: `a5568a2`
- Production deployment: not performed

## Data Safety

Neon was read-only throughout the overhaul and remains intact as the production backup source. The immutable external dump and schema snapshot remain outside the repository with their checksums recorded in `_overhaul/PLAN.md`. The new runtime uses the development Convex deployment `laudable-flamingo-85`; imported buyer data there is treated as production-sensitive. No DNS, production environment, Stripe webhook, or production data-write cutover was changed.

## Local Gates

- `pnpm install --frozen-lockfile`: passed with pnpm 10.33.0.
- `pnpm exec next typegen`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 16 tests passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm build`: passed on Next.js 16.2.10.
- `pnpm audit --prod --registry=https://registry.npmjs.org`: no known vulnerabilities.
- `pnpm audit --registry=https://registry.npmjs.org`: no known vulnerabilities.
- `agent-artifacts validate`: passed with 13 design artifacts, 9 preview QA artifacts, and 7 analysis records.

## Deployed Route Verification

The following preview routes returned HTTP 200: `/`, `/work`, `/work/solana-beach-50`, `/studio`, `/commissions`, `/contact`, `/checkout/50`, `/checkout/cancel/50`, `/checkout/success/50`, `/qr`, `/signin`, `/manifest.json`, `/robots.txt`, and `/sitemap.xml`.

The preview returned HSTS, `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, Referrer-Policy, Permissions-Policy, and `Cross-Origin-Opener-Policy: same-origin-allow-popups`. Vercel correctly added preview-only `X-Robots-Tag: noindex`.

## Browser And Interaction QA

- Desktop public QA ran at 1440 by 1000 pixels.
- Mobile visual QA ran at 500 by 900 pixels; an additional true 390-pixel emulation measured `innerWidth = 390` and `scrollWidth = 390`, proving no horizontal overflow.
- The mobile menu control measured 44 by 44 pixels and opened all five navigation links without clipping.
- Home carousel next/pause/resume controls changed the active artwork and state correctly. Public pages loaded no Clerk browser script.
- Artwork next-image navigation changed the selected source without a React exception.
- The room visualizer opened with the correct `16 × 20 in` dimensions, locked background scrolling, closed with Escape, and restored focus to `View at scale`.
- The current browser runtime exception list was empty after the final interaction pass.
- Unauthenticated `/admin` access redirected to `/signin?redirect_url=%2Fadmin`, confirming the owner boundary. The controlled session did not contain an owner identity, so authenticated owner mutations were not bypassed or live-tested.
- No real Stripe charge, Resend campaign, UploadThing upload, or destructive Convex mutation was triggered.

## Visual Evidence

- Approved design `jws-d2-v1-home-desktop`: `sha256:8cc5eb14f95c408ce785ac8372083586050a1612856a7387ad363689617a2f14`
- Desktop Home preview `jws-overhaul-home-desktop-release`: `sha256:0aa2abf88d15426577ed889a51afa8703ed417408e437c3b31542fe9ceacb451`
- Mobile Home preview `jws-overhaul-home-mobile-release`: `sha256:12b74456d4f979ea36169255ba2a72ef359c4f02e48957d4f553d5134e9961e1`
- Desktop Artwork preview `jws-overhaul-artwork-desktop-final`: `sha256:121685e0768b1510db788906e2459433a8ad12c78f625125c0c2158a3a8e7cc6`
- Mobile Artwork preview `jws-overhaul-artwork-mobile-final`: `sha256:3cc53c73ff5230e2a3b8f605090ac1072e7d2d98049d8092e9d0fb7ab835d5fd`

The release Home artifacts are linked to the approved design in the artifact store. Visual inspection found no incoherent overlap, clipping, artwork filtering, or horizontal overflow.

## Lighthouse Summary

| Route/profile | Performance | Accessibility | Best practices | SEO |    LCP | CLS |
| ------------- | ----------: | ------------: | -------------: | --: | -----: | --: |
| Home desktop  |          98 |           100 |            100 |  69 | 1.08 s |   0 |
| Home mobile   |          91 |           100 |            100 |  69 | 3.54 s |   0 |
| Work desktop  |         100 |           100 |            100 |  69 | 0.56 s |   0 |
| Work mobile   |          96 |           100 |            100 |  69 | 2.75 s |   0 |

Artwork and Checkout desktop accessibility and best-practices scores are 100. Preview SEO is reduced solely by Vercel's intentional noindex response header, and production crawlability remains unmeasured until an approved production deployment.

## Known Limitations And Release Gates

1. Authenticated owner-console and provider mutation QA requires an owner test session and approved test-provider window.
2. The production Convex migration, final Neon delta, DNS/deployment cutover, and Stripe webhook transition remain unexecuted pending explicit approval.
3. Home mobile LCP measured 3.54 seconds. This passes the score target but is not strictly below the 3.5-second LCP target.
4. Vercel recommends moving the project from Node.js 20 to Node.js 24 before October 1, 2026.
5. A report-only Content Security Policy rollout remains a production hardening follow-up.

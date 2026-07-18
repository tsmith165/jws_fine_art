# JWS Fine Art Baseline

Measured July 17, 2026 before the Convex migration or redesign.

## Local Verification

| Check | Result |
| --- | --- |
| `corepack pnpm exec tsc --noEmit` | Passed. |
| `corepack pnpm lint` | Passed with four warnings: one raw `<img>` and three stale effect dependencies. |
| `corepack pnpm build` | Passed on Next.js 16.2.10. Nineteen static pages generated; data-backed routes remain dynamic. |
| `corepack pnpm audit --prod --json` | Passed with zero advisories. |
| `corepack pnpm audit --json` | One moderate dev-only esbuild advisory under Drizzle Kit. |
| Neon dump catalog | Parsed successfully with 41 TOC entries and all five data tables. |
| Asset availability | 481 of 481 unique HTTP assets returned `200`. |
| Source-dimension sample | 9 of 9 primary images matched stored dimensions. |

## Production Lighthouse

Lighthouse 13.0.1 was run against the live Vercel site with a fresh headless Chrome session.

| Page/profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home mobile | 66 | 100 | 77 | 100 | 1.5s | 10.0s | 100ms | 0 |
| Gallery mobile | 61 | 100 | 77 | 100 | 3.8s | 12.6s | 40ms | 0 |
| Home desktop | 90 | 100 | 77 | 100 | 0.3s | 2.0s | 0ms | 0 |

Primary performance findings:

- Mobile LCP is the dominant defect: 10.0s on Home and 12.6s on Gallery.
- Lighthouse estimates 1.3-1.4MB of image-delivery savings on key pages.
- The home desktop transfer is about 3.0MB.
- Roughly 256-259KiB of JavaScript is unused in the audited page loads.
- Render-blocking dependencies, legacy JavaScript, short cache lifetimes, third-party cookies, and back/forward-cache blockers remain.

Raw reports are stored under `_overhaul/baseline/` and will be rerun against the production preview with the same Lighthouse version and profiles.

## Measurable Targets

- Mobile Lighthouse performance: at least 85 on Home and Work under equivalent lab conditions.
- Mobile LCP: below 3.5s in the equivalent Lighthouse run; target below 2.5s where the asset and network permit it.
- Desktop Lighthouse performance: at least 95 on Home.
- Accessibility and SEO: retain 100 in Lighthouse and pass manual keyboard/semantic checks.
- CLS: remain at or below 0.02.
- Initial public-route JavaScript: reduce materially from baseline; no admin/editor code in public route chunks.
- Initial home payload: reduce by at least 40% without lowering visible artwork fidelity.
- Image correctness: no artwork color filters, no upscaling, correct intrinsic dimensions, and a deliberate original/thumbnail policy.

## Visual Baselines

- Existing production captures are registered in `agent-artifacts` for desktop and mobile Home, Gallery, Artwork Details, and Biography.
- Approved direction capture: alias `jws-d2-v1-home-desktop`, artifact ID `sha256:8cc5eb14f95c408ce785ac8372083586050a1612856a7387ad363689617a2f14`.
- Preview QA will link fresh deployed screenshots to the approved direction and will include screenshot inspection plus DOM geometry, console, and network evidence.

# Phase 7 Optimization And Security Verification

## Scope

This phase hardened the Convex-backed Lit Wall implementation, removed the superseded runtime stack, and completed final deployed preview QA. Neon remained read-only and production was not deployed or reconfigured.

## Runtime And Dependency Cleanup

- Public and owner reads now use Convex directly. The temporary dual-read adapter, Neon runtime client, and legacy UI implementations were removed.
- Drizzle Kit, Drizzle ORM, generated Drizzle snapshots, and database configuration were removed because no application or retained migration script used them.
- The raw PostgreSQL export/import verification tooling remains available under `scripts/migration/`, while the immutable Neon dump and schema snapshot remain outside the repository.
- Unused UI, analytics, date, maps, icon, selection, tooltip, animation, and server database packages were removed.
- `pnpm audit --prod --registry=https://registry.npmjs.org`: no known vulnerabilities.
- `pnpm audit --registry=https://registry.npmjs.org`: no known vulnerabilities.

## Security And Abuse Controls

- Public inquiry and subscription writes use server-derived HMAC rate-limit keys and Convex-enforced hourly limits.
- Both public forms include honeypot rejection without storing raw client IP addresses.
- Clerk owner metadata gates the Next owner console, while private Convex functions retain the final authorization boundary.
- Response headers disable framing and MIME sniffing, constrain referrers and browser permissions, and remove the framework disclosure header.
- Existing Stripe signature, replay, price-authority, and idempotency tests remain green.

## Performance And Accessibility

- The hero renders only the active image, limits the sequence to five works, and eagerly loads only the first slide.
- Clerk's browser provider is scoped to `/signin`; public routes do not download Clerk's client runtime.
- Public hero derivatives use a deliberate quality target while original and detail-view assets remain unchanged.
- PostHog does not initialize when its public key is absent.
- Mobile hero typography was constrained to avoid clipping.
- Hero slide selectors now retain the thin visual treatment with 44 by 44 pixel interaction targets.
- Owner progress animation and public motion respect reduced-motion preferences.
- The room visualizer now traps focus, closes with Escape, locks background scrolling, and restores the invoking control's focus.
- The sitemap is generated from current public Convex artwork; robots output has one typed source of truth.

## Local Release Gate

- `pnpm exec next typegen`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 16 tests passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm build`: passed on Next.js 16.2.10.
- Production and complete dependency audits: no known vulnerabilities.

## Final Preview And Lighthouse

- Preview: `https://jwsfineart-ollwousi8-tsmith-hobby.vercel.app`
- Deployment: `dpl_Hyrr6AUSaTdPZV7zsNNomcFXCpGp`

| Route/profile    | Performance | Accessibility | Best practices | SEO |        LCP |        CLS |        TBT |
| ---------------- | ----------: | ------------: | -------------: | --: | ---------: | ---------: | ---------: |
| Home desktop     |          98 |           100 |            100 |  69 |     1.08 s |          0 |       0 ms |
| Home mobile      |          91 |           100 |            100 |  69 |     3.54 s |          0 |       0 ms |
| Work desktop     |         100 |           100 |            100 |  69 |     0.56 s |          0 |       0 ms |
| Work mobile      |          96 |           100 |            100 |  69 |     2.75 s |          0 |      20 ms |
| Artwork desktop  |  not scored |           100 |            100 |  69 | not scored | not scored | not scored |
| Checkout desktop |  not scored |           100 |            100 |  66 | not scored | not scored | not scored |

The Home and Work runs use the same desktop and mobile Lighthouse profiles before and after optimization. Home improved from 90 to 98 on desktop and 87 to 91 on mobile. Work improved from 99 to 100 on desktop and 92 to 96 on mobile. Best practices improved from 77 to 100 on all four measured profiles.

Preview SEO is intentionally below the production target because Vercel adds `X-Robots-Tag: noindex` to preview deployments. Canonical metadata, dynamic sitemap, robots output, and artwork JSON-LD are implemented, but production crawlability cannot be measured without an approved production deployment. Home mobile LCP is 3.54 seconds, which is at the displayed 3.5-second threshold but not strictly below the written target. All other performance targets pass.

## Image Pipeline

- UploadThing retains the original object without client-side resizing, format conversion, or canvas recompression.
- The server fetches only trusted UploadThing origins, enforces an inspection byte limit, and uses Sharp metadata to validate intrinsic dimensions and orientation metadata.
- Next Image creates responsive delivery derivatives from the preserved source. Detail and original-image paths do not add another application-level lossy transform.
- Artwork image elements remain at full opacity with no saturation, contrast, blur, or color filter.
- Live HEIC, embedded color-profile, and large-file uploads were not performed against the preview because the release guardrails prohibit creating provider-side data. Those fixtures remain part of the authenticated pre-production provider test plan.

## Remaining Production Gates

Production deployment, production Convex cutover, DNS changes, live checkout, real campaign sends, uploads, and destructive owner mutations remain out of scope without explicit approval. The Vercel project also reports that Node.js 20 will be deprecated after October 1, 2026; the production project should be moved to Node.js 24 during the approved release window. The current header set is hardened but does not yet include a Content Security Policy, so a report-only CSP rollout remains a production follow-up.

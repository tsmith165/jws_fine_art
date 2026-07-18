# Phase 7 Optimization And Security Verification

## Scope

This phase hardened the Convex-backed Lit Wall implementation, removed the superseded runtime stack, and prepared the branch for final deployed preview QA. Neon remained read-only and production was not deployed or reconfigured.

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

## Remaining Gate

A new Vercel branch preview must pass desktop/mobile browser QA, DOM layout inspection, console/network inspection, and Lighthouse checks. Production deployment, production Convex cutover, DNS changes, live checkout, real campaign sends, uploads, and destructive owner mutations remain out of scope without explicit approval.

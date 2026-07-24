# JWS Fine Art

Private production application for Jill Weeks Smith Fine Art. The repository contains the public gallery, Stripe checkout, collector contact and mailing flows, and the authenticated owner workspace.

## Runtime

- Next.js 16 and React 19
- TypeScript, Tailwind CSS 4, and Zustand 5
- Convex for operational data and server-enforced authorization
- Clerk for owner identity
- UploadThing for original artwork media
- Stripe Checkout and signed webhooks for purchases
- Resend for transactional and campaign email
- Vercel for hosting

Use Node 24 and pnpm 10. The version files and `packageManager` field are authoritative.

## Local Development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm exec convex dev --once
pnpm dev
```

Local and preview environments must use Stripe test credentials. The application refuses live Stripe credentials outside `VERCEL_ENV=production`, and production refuses test credentials.

Required application variables are checked by `pnpm release:check-env` without printing their values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`
- `CONVEX_SERVER_WRITE_SECRET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- `STRIPE_AUTOMATIC_TAX_ENABLED=true` and `STRIPE_ARTWORK_TAX_CODE` when Stripe Tax is activated
- `UPLOADTHING_TOKEN`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `CRON_SECRET`
- `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- `POSTHOG_PROJECT_ID`, `POSTHOG_PERSONAL_API_KEY`, and `POSTHOG_API_HOST`

The owner analytics view uses a server-only PostHog read integration:

- `POSTHOG_PROJECT_ID`
- `POSTHOG_PERSONAL_API_KEY` (a read-only personal API key with query access)
- `POSTHOG_API_HOST` (optional; defaults to the matching US or EU PostHog dashboard host)

These variables are intentionally separate from the public browser capture key. Never expose the personal API key with a `NEXT_PUBLIC_` prefix.
Browser capture runs only on `jwsfineart.com` and `www.jwsfineart.com`, excludes owner/auth routes, strips query strings, disables autocapture and session recording, and records only explicit privacy-safe events. Preview capture remains off unless `NEXT_PUBLIC_POSTHOG_CAPTURE_PREVIEWS=true` is deliberately configured.

The Convex deployment also requires Clerk's JWT issuer configuration. Never share live Stripe credentials with Development or Preview scopes.

Stripe Tax is fail-closed behind `STRIPE_AUTOMATIC_TAX_ENABLED`. Production requires it to be enabled, requires active Stripe Tax settings
and at least one active registration, and uses `txcd_99999999` (General - Tangible Goods) for original physical artwork unless tax counsel
selects a more specific code. Configure the Stripe account origin and registrations in the Stripe Dashboard before production checkout.
Checkout uses tax-inclusive pricing so the displayed artwork and delivery total does not increase; Stripe records the jurisdiction-specific
tax portion within that total. Local pickup collects a billing address for the tax calculation, while shipped orders use Stripe's collected
shipping address.

Mailing delivery runs in Convex with per-recipient idempotency, leases, retries, plain-text alternatives, and signed unsubscribe links.
Configure a Resend webhook at `https://www.jwsfineart.com/api/resend/webhook` for sent, delivered, delayed, bounced, complained, suppressed,
and failed email events, then store its signing secret as `RESEND_WEBHOOK_SECRET` in Vercel. The webhook suppresses bounced and complaining
addresses and feeds the owner Mailing and Business health views. `CRON_SECRET` protects the daily Stripe reconciliation route.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm audit --prod
```

Release-specific checks are documented in [_overhaul/CUTOVER_RUNBOOK.md](_overhaul/CUTOVER_RUNBOOK.md). The scripts fail closed on unresolved migrations, provider drift, open checkouts, webhook quarantine, campaign failures, missing environment configuration, and unsafe Stripe credential modes.

## Data Safety

Neon is the immutable legacy backup source and must remain read-only. Production Convex imports require an explicit target confirmation and create a checksummed export before importing. Production deployment, DNS, webhook, secret, and write-cutover changes require explicit approval.

## License

This is proprietary, private software. See [LICENSE](LICENSE).

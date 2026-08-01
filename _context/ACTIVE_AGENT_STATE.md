# Active Agent State

## July 31 View At Scale Room Visualizer

- Objective: re-enable the artwork-detail "View at scale" feature using the
  artist-provided cleaned living-room photograph at
  `/Users/tsmith/Downloads/view_at_scale_image.png`.
- The source is staged as the `view-at-scale-room-plate` design artifact. A
  1538 × 1023, 100 KB WebP is stored at
  `public/editorial/rooms/view-at-scale-living-room.webp`.
- Calibration uses the original IMG_0593 photograph and its recorded 30 × 24
  in finished "Swell" reference at 21.2 px/in. The clear sofa/light wall area
  is approximately 96 × 36 in.
- UI decision: one authentic fixed-position room, no synthetic presets or drag
  controls; true relative scale remains visible when a piece is too large.
- Implemented in `src/components/lit-wall/RoomVisualizer.tsx`,
  `ArtworkActions.tsx`, `src/lib/roomScale.ts`, `src/styles/lit-wall.css`, and
  `tests/lib/roomScale.test.ts`.
- Local verification passed: 125 tests, TypeScript, lint (one pre-existing
  ResilientImage warning), production build, and desktop/mobile browser QA.
- Final local preview artifacts: `view-at-scale-final-desktop` and
  `view-at-scale-final-mobile`.
- Artifact validation passed. Commit `d2acc0d` is pushed to
  `feat/full-site-overhaul`.
- Vercel production deployment `dpl_FzdfBosneVCywPnbUrjuDMNKsy1a` is ready
  and aliased to `https://www.jwsfineart.com`.
- Production desktop (1440 × 1000) and mobile (390 × 844) QA passed: the room
  plate loads at its native 1538 × 1023 resolution, scale and aspect ratio are
  correct, the modal does not overflow or shift, focus/scroll locking restores
  correctly, and the browser console has no warnings or errors.

## July 31 Tax Policy Confirmation

- Owner reconfirmed that Stripe Tax must remain disabled. Artwork prices are
  tax-inclusive; checkout charges the listed artwork price plus delivery and
  never adds a separate tax amount.
- Production Vercel `STRIPE_AUTOMATIC_TAX_ENABLED` was explicitly set to
  `false` and redeployed. Deployment
  `dpl_8F6yCNsAe7UVcf4KPrXugXkE75Fd` is Ready and aliased to
  `https://www.jwsfineart.com`.
- The production environment audit reports `stripeAutomaticTax: false` and
  `taxMode: inclusive-listed-price`. Sensitive Production-only variables are
  intentionally unreadable through `vercel env run`, so its unrelated missing
  variable warnings are not deployment gaps.
- Clerk production migration remains deferred. Clerk protects only the owner
  `/admin` surface and is not loaded on public pages; authorizing its Dashboard
  would only be needed if the studio chooses to eliminate the accepted
  development-instance warning and migrate admin identities.
- Commit `9cb7e86` corrects the stale README tax instructions and is pushed to
  `origin/feat/full-site-overhaul`.

## July 30 Stripe Audit And Historical Sale Import

- Production Stripe is confirmed fully LIVE: enabled live-mode webhook
  `we_1PLliwD8CTpNeM29eSvhmUXB` at `/api/checkout/webhook` (11 events),
  charges/payouts enabled on `acct_1If4C9D8CTpNeM29`, zero open sessions and
  zero pending webhook deliveries. Newer production env vars are
  sensitive-typed (never readable back) — expected, not a gap.
- Audit found 5 real sales (~$2,965) plus 2 owner test charges that existed
  only in Stripe: in-person Stripe iPhone-app charges from 2024-2025 the old
  site never recorded. All matching artworks were already marked sold, so
  there was no double-sale risk — only understated books.
- `migrations:importHistoricalStripeOrders` (idempotent via
  `by_payment_intent_id`, dry-run flag, audit `orderEvents`) imported all 7
  into development and production as CA local-pickup orders: Coastal Cacti
  $195, Morning Glint $495, Balboa Park Sunrise Walkers $625, two
  unidentified in-person sales ($1,155 Eric Vizcaino and $495), and two
  flagged test charges. Re-run returns 7 × "already recorded".
- Production book after import: 7 real sales totaling $3,955, all-time tax
  set-aside $248.85 (informational for pre-2026 rows; "This year" remains
  the filing number), 10 test orders hidden.
- The 2022-2023 orders reference charges on a different, older Stripe
  account (`...AuEqsFZjnt`); historical only.
- Hygiene note: the live Stripe secret key is present in this workspace's
  `.env.local` (fail-safed by environment assertions; rotate if the
  workspace is ever compromised).

## July 30 Optional Story And Image Optimizer Outage

- Artist feedback (Jill, July 29): publishing must not require the artwork
  story, and her new uploads (piece #104, Sunset Session) showed broken
  thumbnails in the editor and the public filmstrip.
- Story is now optional everywhere: missing story is a warning (never blocks
  save/publish), the Publish Check story item reads ready with optional
  guidance, and a bare missing story no longer counts toward Needs Attention
  (length errors still do). Tests updated (122 pass).
- Root cause of broken images: the Vercel Hobby plan image-optimization quota
  is exhausted — every `/_next/image` request returns
  `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED` account-wide. Piece #104's
  files are valid JPEGs on the new `ufyypy3g6v.ufs.sh` UploadThing domain
  (`smallUrl` null on owner uploads, which is expected).
- Mitigation shipped: `ResilientImage` wraps next/image and falls back to the
  unoptimized source on error; swapped into all 19 non-progressive usages.
  `ProgressiveArtworkImage` and `ResilientImage` both check DOM state on
  mount because images that settle before hydration never fire onLoad or
  onError.
- Live verification on `/work/sunset-session-104`: optimizer 402 confirmed;
  fallback flips thumbs to direct ufs.sh URLs; the direct file fetches (200,
  4.97 MB) and decodes (2687 × 3439). The browser-pane test environment has a
  zero-height viewport, so lazy images never load there — that is a test
  artifact, not a site bug. Homepage shows zero hard image failures.
- Invisible edge cases without fallback (accepted): `ImageWarmup` preloaders
  and progressive placeholders may 402 silently; both are aria-hidden.
- RESOLVED July 30: the project was transferred via the Vercel API from the
  Hobby team (`tsmith-hobby`) to the Pro team (`tsmith`,
  `team_J0FKSVEdvLiGWO4vFAvzEOyQ`); domains and env vars moved with it, the
  local `.vercel/project.json` orgId was updated, and a fresh production
  deploy from the new team is aliased. The optimizer returns 200 again for
  both legacy and new-upload images (5 MB source → 23 KB thumbnail).
- Transformation churn was also cut ~90% (commit `45323cd`): exactly two
  quality tiers (75 placeholder / 95 artwork), width buckets reduced to
  [640, 828, 1080, 1920, 2560] + [64, 128, 256], and a 31-day image cache.
  `ResilientImage` remains as permanent insurance against optimizer outages.
- Commits `b3f65a5` and `0fcd115` pushed and deployed
  (`www.jwsfineart.com`); no Convex changes.

## July 24 Performance, Dashboard Redesign, And Ops Alerts

- `main` is fast-forwarded to the overhaul branch (`fcfbb2e..e1a5f78`);
  production continues to deploy via `vercel deploy --prod`.
- Clerk is scoped to `/signin` and `/signout` only (`StudioAuthProvider` in
  route layouts; root layout no longer mounts ClerkProvider). Server `auth()`
  still works everywhere via `src/proxy.ts`. Public pages ship zero Clerk JS.
- Lighthouse mobile home page: performance 74 → 90, best-practices 77 → 100,
  SEO 100, accessibility 100. LCP 6.5s → 3.3s, TTI 6.7s → 3.3s, unused JS
  266 KiB → 54 KiB. Both prior best-practices failures (third-party cookies,
  inspector issues) were Clerk dev-instance artifacts and are gone, so the
  Clerk production migration is NOT needed for scores; it would only remove
  the dev-instance warning inside authenticated admin pages.
- `/admin/business` redesign: primary Net collected hero + Tax to set aside +
  Orders; single-column gross→refunds→net waterfall ledger with context rows
  (shipping, tax set-aside, fee window explicitly labeled); trailing-12-month
  CSS revenue trend from `purchasedOn`; Started→Paid funnel with a separate
  did-not-complete row; latest-orders table with exact tax amounts.
- Operational email alerts: `convex/opsAlerts.ts` internal action (3 retries,
  Resend idempotency key `ops-alert-<kind>-<sourceId>`, recipient
  jwsfineart@gmail.com) fired on quarantine open, webhook retry exhaustion,
  dispute open, and confirmation-email exhaustion.
- Verification: lint, typecheck, 18 files / 121 tests, production build.
  Commits `b58b1e4` and `395e511` pushed; both Convex deployments updated;
  Vercel production deployed and aliased; post-deploy Lighthouse confirmed
  the scores above; home page HTML contains no Clerk references while
  `/signin` still loads it.
- Not yet verified: authenticated visual QA of the redesigned Business page
  (server-rendered from typed data; build passed).

## July 24 Tax Set-Aside Tracking

- Implemented per-order CA tax set-aside tracking per
  `docs/PAYMENTS_AND_TAXES.md`: `shared/tax.ts` policy module (775 bps San
  Diego studio rate, jurisdiction classification, tax-inclusive back-out),
  `orders.taxJurisdiction/taxRateBps/taxSetAsideCents` schema fields, stamping
  in `commerce.recordPaidCheckout`, idempotent
  `migrations:backfillOrderTaxSetAside`, business dashboard "Tax to set
  aside" + "This year" range, and a three-section CSV export (summary,
  sales-by-destination for nexus checks, per-order tax rows).
- Verification: lint, typecheck, 18 test files / 120 tests, production build.
- Development Convex deployed and backfilled: 10 orders → 7 CA, 1 interstate,
  2 international, 0 address-unknown.
- Production Convex deployed; production backfill applied (10 orders → 7 CA,
  1 interstate, 2 international). Vercel deployment
  `dpl_...8uwy5szu7` (commit `7b4e57d`) is ready and aliased.
- Follow-up (commit `ea2ae20`): `orders.isTest` flag; owner mark/unmark on
  `/admin/orders` with default-hidden test orders and a show toggle;
  Business/exports/fulfillment exclude test orders and report the excluded
  count. `migrations:backfillTestOrders` marked the eight $1 owner test
  purchases in production and development.
- Tax classification fix: a parseable U.S. address now outranks the legacy
  `international` flag. Production re-backfill corrected 2 orders — the real
  $495 Indio CA sale now carries a $35.60 set-aside. After exclusions, the
  real book is 2 orders: one CA ($35.60 set aside), one interstate (exempt).
- Verification: lint, typecheck, 18 files / 121 tests, production build.
- Final Vercel production deployment (`jwsfineart-lffa1hybk`, commit
  `ea2ae20`) is ready and aliased to `https://www.jwsfineart.com`. The
  test-order tooling and corrected tax reporting are fully live; no pending
  release work remains for this effort.

## July 23 Tax-Inclusive Pricing And Clerk Decision

- Owner decisions: listed prices are tax-inclusive and Jill remits sales tax
  herself, so Stripe Tax stays implemented but disabled
  (`STRIPE_AUTOMATIC_TAX_ENABLED=false` in production Vercel, disabled default
  everywhere). Do not create Stripe Tax registrations.
- The Clerk development-instance warning is an accepted risk: only 4-5 admin
  users ever sign in, so the dev→production Clerk migration is intentionally
  deferred. Do not treat the console warning as a release blocker.
- `scripts/release/check-environment.ts` and `scripts/release/audit-stripe.ts`
  no longer fail when Stripe Tax is disabled; tax provider checks gate a
  release only when the flag is enabled. Environment check reports
  `taxMode: inclusive-listed-price`.
- Tax-included copy is standardized to `Sales tax is included in the listed
  price.` across the work detail page (new `lw-price-note`), checkout page,
  checkout summary/small print, shipping estimator, `/shipping`, the contact
  collector guide, and the purchase confirmation email.
- Verification: lint, typecheck, 17 test files / 114 tests, and the production
  build pass.
- Source commit `c8edfc9` is pushed to `origin/feat/full-site-overhaul`.
- Vercel production deployment `dpl_VhCwrWqAYtsci8aFaMoRUoLEdQQu` is ready and
  aliased to `https://www.jwsfineart.com`; it also activates the flipped
  `STRIPE_AUTOMATIC_TAX_ENABLED=false`, so live checkout sessions no longer
  request Stripe automatic tax.
- Live copy verified on `/shipping`, `/contact`, and `/work/dawn-96`
  (`lw-price-note` renders under the price).

## July 23 Business, Optional Stripe Tax Path, And Mailing Production Release

- Objective: add a fail-closed optional Stripe Tax path, a production
  operations dashboard, and durable provider-aware studio campaigns. The
  later owner decision keeps Stripe Tax disabled and uses tax-inclusive listed
  prices; see `July 23 Tax-Inclusive Pricing And Clerk Decision` above.
- Production Resend webhook
  `ba0f5b24-e1cb-4e86-81ed-7cb5484a1d32` is enabled at
  `https://www.jwsfineart.com/api/resend/webhook` for the seven delivery,
  delay, bounce, complaint, failure, and suppression events used by the app.
- `RESEND_WEBHOOK_SECRET` is stored as a sensitive Production-only Vercel
  environment variable. Redeploy `CxYb241ZZcsSNNg7uPZbpa9nQ7a6` is Ready and
  assigned to `https://www.jwsfineart.com`.
- A production campaign test to the studio inbox produced signed
  `email.sent` and `email.delivered` events. Resend received `200 OK` on the
  first attempt, and the app's Mailing dashboard now reports the provider as
  Healthy. The Business dashboard reports no unresolved provider issues.
- Implemented:
  - `/admin/business` reporting, reconciliation, CSV export, operational
    alerts, owner retry/resolution actions, and daily reconciliation cron.
  - Per-recipient Convex campaign workers with leases, bounded retries, stable
    provider idempotency, plain-text alternatives, signed unsubscribe links,
    provider tags, and automatic bounce/complaint suppression.
  - Verified Resend webhook intake with replay protection and out-of-order
    event handling.
  - Durable purchase-confirmation outcome tracking and retry controls.
  - Stripe refund/dispute state, reconciliation fee/net snapshots, and
    release audits for Stripe, Resend, Convex, and environment configuration.
- Production and development Convex deployments received the additive schema
  and functions. One final production redeploy is still needed after the
  reconciliation supersession refinement.
- Production Vercel contains encrypted configuration for the dormant Tax path,
  but `STRIPE_AUTOMATIC_TAX_ENABLED=false`. Do not create Stripe Tax
  registrations while the tax-inclusive manual-remittance policy is active.
- The existing Resend application key remains send-only by design. Dashboard
  inspection verified the `jwsfineart.com` sending domain and DKIM/SPF setup.
- Source commits `521ffd6`, `6e1cf53`, and `4df72ef` are pushed to
  `origin/feat/full-site-overhaul`. Production Vercel deployment
  `dpl_35Z2roXMv7LxMxTFc3GrWWrvCWXK` is ready and aliased to
  `https://www.jwsfineart.com`.
- Production desktop and mobile QA found no horizontal overflow on Business or
  Mailing. Mailing correctly reports `Awaiting verification` until a signed
  Resend event is received.
- The first live Stripe reconciliation completed successfully. Production
  Convex reports no failed durable work, unresolved findings, open checkout
  intents, or webhook quarantines. Stripe reports no open Checkout sessions or
  pending webhook deliveries.
- QA artifact aliases `business-operations-production-desktop`,
  `business-operations-production-mobile`, `mailing-production-ready-desktop`,
  and `mailing-production-ready-mobile` validate successfully.
- Verification: lint, TypeScript, 17 test files / 114 tests, and the Node 24
  production build pass.
- The Clerk development-instance warning is an accepted admin-only risk. Clerk
  is not loaded on public pages, and production-instance migration is deferred.

## July 23 Release-Date Baseline, Studio, And Tax-Ready Checkout

- Current objective: finish the release-date baseline/editor warning,
  studio imagery, exact owner attention counts, and tax-ready checkout release.
- Production Convex `hushed-crane-268` and development
  `laudable-flamingo-85` are deployed.
- Artwork migration results:
  - Production: 92 scanned, 92 seeded, verification rerun changed 0.
  - Development: 86 scanned, 86 seeded.
- Historical source data had no artwork-level `completedAt`. The provisional
  baseline is `completedAt ?? releasedAt ?? importedAt`, copied into both
  completion and release dates when missing. Equality is a visible
  `Release date needs review` attention issue.
- `/admin/artwork` now derives Needs details from the exact shared Needs
  Attention rules/count and right-aligns Catalog View.
- Checkout has a fail-closed, tax-inclusive Stripe Tax path behind
  `STRIPE_AUTOMATIC_TAX_ENABLED` plus a reviewed
  `STRIPE_ARTWORK_TAX_CODE`. The flag must remain off until Stripe account
  registration/origin/tax-code review is complete.
- Shipped PaymentIntent events now carry Stripe addresses. Automatic-tax
  fulfillment waits for `checkout.session.completed`; missing domestic
  addresses quarantine.
- The Studio portrait is narrower. The timeline collage now uses a 5:4 lead
  crop plus two square crops, edge-to-edge with `object-fit: cover` and no
  backing panel.
- Automated verification already passed before the final collage adjustment:
  ESLint, TypeScript, 17 test files / 111 tests, and production build.
- Remaining: rerun the final automated gate, commit and push all tracked
  changes, deploy Vercel production, inspect Studio/admin production UI,
  validate artifacts, and stop the local server.

## July 23 Catalog Dates, Studio, Commerce, And Mailing Follow-up

- Objective: seed artwork release dates from a completion-date baseline, expose
  unreviewed seeded dates, align owner attention counts and catalog filtering,
  correct studio imagery, and audit tax, address collection, business metrics,
  and mailing production readiness.
- OMP read-only audits in progress:
  - Stripe/tax/address: `7740ae39-409b-4909-817e-e94f95decd22`
  - Business dashboard: `10c9f886-cdac-44aa-9c0e-44f14b06d787`
  - Mailing: `80cd7da9-edc7-4c14-ae17-0af40e74322f`
- Current production records do not contain an artwork-level `completedAt`;
  the only existing `completedAt` is migration-run bookkeeping. Production
  record shape was verified before choosing a backfill strategy.
- Next action: implement the catalog/studio changes, settle the completion-date
  baseline explicitly, then verify and deploy before synthesizing the audits.

## July 23 Commerce Hardening And Shipping Release

- Objective: deny second purchases of one-of-one artwork, make Stripe webhook
  and email processing durable, release canceled reservations, add Stripe
  idempotency, finish endpoint configuration, and replace shipping with the
  artist-approved tier and pickup policy.
- Source commits `8134a73` and `4fee600` are on
  `origin/feat/full-site-overhaul`.
- Production Convex `hushed-crane-268` is deployed with the webhook inbox,
  notification outbox, retry/watchdog workers, delivery policy snapshots,
  pickup fulfillment states, and atomic second-sale prevention.
- Vercel deployment `dpl_72qwLkeVXvy3XrBMmR2chR6MPKje` is ready and aliased
  to `https://www.jwsfineart.com`.
- Checkout Session creation uses the stable key
  `checkout-intent:${intentId}`. Cancel verifies a cancellation token, expires
  an open Session, and releases the reservation.
- Shipping policy version `2026-07-23`: Small $25/$45, Medium $50/$75, Large
  $100/$130, local pickup $0, international/oversize studio quote.
- Live Stripe endpoint `we_1PLliwD8CTpNeM29eSvhmUXB` is active at
  `https://www.jwsfineart.com/api/checkout/webhook` with 11 events. Preview
  endpoint `we_1TuyT0D8CTpNeM29FYhaMZSD` also has 11 events. Stale test endpoint
  `we_1PIIbaD8CTpNeM29VnrKGRwJ` was deleted.
- Stripe endpoint API version remains `2024-04-10`; the Dashboard does not
  expose an in-place change, so it was not rolled with the signing secret in
  this release.
- Automated verification: lint, typecheck, and 17 test files / 108 tests pass.
- Production visual QA at `1440 × 1000` and `390 × 844`: no horizontal
  overflow or clipped checkout content; domestic checkout is $495 + $50 =
  $545, pickup is $495 + $0, and international correctly blocks payment for a
  studio quote. Calculator result height stayed `782.59px` across Small,
  Medium, framed, and pickup; international grew only `13.98px` for its longer
  explanation.
- QA artifacts: `commerce-shipping-desktop`,
  `commerce-shipping-mobile`, `commerce-checkout-desktop`, and
  `commerce-checkout-mobile`.

## July 23 Primary Media, Attention Count, And Artwork Form Follow-up

- Objective: make primary-image replacement explicit in the media modal, show
  the live Needs Attention piece count in the owner navigation, normalize
  Instagram share values to bare tokens, and improve the Categories field
  grouping.
- Implemented an explicit `Replace primary` action. It moves the modal to a
  dedicated replacement state, preselects the Primary upload role, and explains
  where the image is used before any public image changes.
- OwnerShell now calculates its badge with the same active-artwork attention
  rules as `/admin/categories`; the read is request-cached so pages that already
  load artwork media reuse the same query.
- Instagram values now store only the token after `?igsh=`. Full share links and
  prefixed values normalize in the form and save action. Loading an editor with
  legacy prefixed data runs an owner-authenticated Convex repair mutation and
  records an audit event.
- The Categories field now has a contained collection-placement surface,
  selected-count status, grouped options, and stacked mobile treatment.
- Verification passed: formatting, `git diff --check`, lint, typecheck, all 103
  tests, and the Node 24 Next.js production build.
- Source commits `42df371` and `fcb2719` are pushed to
  `origin/feat/full-site-overhaul`.
- Convex production `hushed-crane-268` and development
  `laudable-flamingo-85` are deployed.
- Final Vercel deployment `dpl_FdCm2SntZijgcZGASod5NiEVPBkn` is ready and
  aliased to `https://www.jwsfineart.com`.
- Authenticated production QA passed at `1440 × 1000` and `390 × 844`. The
  primary action entered the dedicated replacement state without uploading,
  saving, or changing artwork data; the modal and page had zero horizontal
  overflow.
- The navigation badge and Needs Attention queue both report 71 pieces. The
  badge is centered at desktop and visible inside the collapsed mobile rail.
  Categories render as four grouped desktop choices and one-column mobile
  choices. The Instagram field contains the bare `CmuPRcgBwQr` token on artwork
  41 and exposes the new guidance.
- Production browser logs contained no application errors. The known Clerk
  development-key warning remains.
- Artifact aliases: `admin-form-final-production-desktop`,
  `admin-form-final-production-mobile`, and
  `admin-media-primary-final-production-desktop`. Artifact validation passed
  with 72 design artifacts, 118 preview QA artifacts, and 54 analysis records.

## July 23 Catalog Artwork Image Fidelity

- Objective: remove soft/grainy public catalog artwork renditions while keeping
  progressive loading and bounded image transfer sizes; fold the existing
  Categorize surface into a catalog-wide Needs Attention workflow; remove the
  declined commission-types section.
- Live production comparison on `Morning Burn Off` found the catalog requested
  `w=1920` while the matching detail page requested `w=3840` at DPR 2. All
  requests completed, so the active cause is delivery policy rather than a
  stuck placeholder.
- Implemented: shared catalog policy at quality 95 with a bounded 840 px
  desktop slot; original-source retry after Next optimizer failure; project
  image-fidelity rules in `AGENTS.md` and `CLAUDE.md`.
- `/admin/categories` is now Needs Attention with queues for image quality,
  listing details, uncategorized pieces, all issues, and all artwork. Image
  repairs deep-link to the existing editor media modal; metadata repairs link
  to the matching field; categories remain editable in place.
- The commission section titled `Personal work, grounded in a real story.` and
  its unused CSS are removed.
- `Break of Dawn` has a 1024 × 768 original and is the only audited visible
  piece that remains source-resolution limited.
- Local public QA: `/work` serves `w=1080&q=95` at DPR 1 desktop and
  `w=640&q=95` mobile, with final opacity 1, placeholder opacity 0, and zero
  overflow. Homepage collection cards use the same policy. `/commissions`
  contains only hero, process, and notes sections at mobile width.
- Automated status: lint, typecheck, and all 102 tests pass. Webpack production
  build is pending after the final workflow changes.
- Local admin visual QA is auth-blocked at `/not-authorized`; verify the
  authenticated Needs Attention desktop/mobile experience after Vercel deploy.
- Next action: production build, commit/push, Vercel deployment, authenticated
  production visual QA, and artifact validation.

## July 23 Shipping Planning Label Icon

- Moved the package icon from beside the `Compact` classification to the left
  of the `Planning estimate` label.
- Source commit `af7d551` is pushed to
  `origin/feat/full-site-overhaul`.
- Vercel deployment `dpl_28brebh5zCdTT2wQKQ2CxzKuh8yT` is ready and aliased
  to `https://www.jwsfineart.com`. No Convex deployment was needed.
- Production desktop (`1440 × 1000`) and mobile (`390 × 844`) QA confirmed one
  icon in the planning label, no icon or reserved icon column beside `Compact`,
  less than `0.01px` icon/text centerline difference, and zero horizontal
  overflow.
- Verification passed: Prettier, `git diff --check`, targeted lint, typecheck,
  all 88 tests, webpack production build, Vercel Turbopack build, and live
  visual QA.
- Preview aliases: `shipping-planning-icon-production-desktop` and
  `shipping-planning-icon-production-mobile`.

## July 23 Checkout Total Polish

- Removed the visible break in the total separator by eliminating the checkout
  summary grid’s column gap; the two 1px cell borders now meet with a measured
  `0px` gap.
- Changed the label to `Total due` and updated the Stripe security note to:
  `Checkout is secured with our payment partner Stripe. Card details are never
  touched on this site.`
- Source commit `dcd9602` is pushed to
  `origin/feat/full-site-overhaul`.
- Vercel deployment `dpl_8uQQYKyYLfEpcEkkC93Q1yckJuQw` is ready and aliased
  to `https://www.jwsfineart.com`.
- Production desktop and `390 × 844` mobile QA confirmed a `0px` separator gap,
  zero horizontal overflow, no clipped checkout summary/button/security copy,
  and the requested copy. No page-origin console errors were present.
- Verification passed: Prettier, `git diff --check`, lint, typecheck, all 88
  tests, webpack production build, Vercel Turbopack build, and live visual QA.
- Preview aliases: `checkout-total-polish-production-desktop` and
  `checkout-total-polish-production-mobile`.

## July 23 Checkout Shipping Refinement

- Aligned the real checkout shipping card with the finalized `/shipping`
  calculator: four stable cost-factor rows, whitespace instead of internal
  separator rules, clear active/inactive factors, and a reserved international
  duties note.
- Destination changes now show a 450 ms Recalculating state, keep the prior
  amount visible, disable the Stripe continuation action, and replace its label
  with Updating delivery total until the trusted estimate is ready.
- Source commit `d3962e2` is pushed to
  `origin/feat/full-site-overhaul`.
- Vercel deployment `dpl_2vtiD4cqRsajmMX13QXnet4aWTg7` is ready and aliased
  to `https://www.jwsfineart.com`. No Convex deployment was needed.
- Production desktop QA on artwork `#103`: shipping card stayed exactly
  `397.796875px` before, during, and after switching to international;
  payment was disabled during recalculation; four factor rows had `14px` gaps,
  no row borders, and zero horizontal overflow.
- Production mobile QA at `390 × 844`: card height changed by less than one
  pixel (`415.3984375px` to `416.0859375px`), with four borderless factor rows,
  `14px` gaps, and zero horizontal overflow.
- Verification passed: Prettier, `git diff --check`, lint, typecheck, all 88
  tests, webpack production build, Vercel Turbopack production build, and live
  desktop/mobile visual QA.
- Production console errors: none. The known Clerk development-key warning
  remains.
- Preview aliases: `checkout-shipping-refined-production-desktop` and
  `checkout-shipping-refined-production-mobile`.

## July 23 Shipping Calculator Spacing Follow-up

- Reduced the calculator form’s real row spacing to 24px and disabled Grid’s
  default track stretching, which had visually inflated the gaps to fill the
  taller result panel.
- Bottom-aligned the Protection Needs controls so the Framed artwork checkbox
  container exactly matches the Surface and glazing select.
- Commit `43e81de` is pushed to `origin/feat/full-site-overhaul`.
- Vercel deployment `dpl_86Jt4Ef1EHrKhLVtALa9Jk2KcPqN` is ready and aliased
  to `https://www.jwsfineart.com`.
- Production desktop geometry: all section gaps 24px; select
  `250.992 × 56px`; checkbox `251 × 56px`; bottoms aligned within one pixel.
- Production mobile geometry: all section gaps 24px; both controls
  `308 × 56px`; zero horizontal overflow.
- Prettier, `git diff --check`, lint, typecheck, all 88 tests, and the
  production build passed.
- Production console errors: none. The known Clerk development-key warning
  remains.
- Artifact aliases: `shipping-calculator-spacing-before`,
  `shipping-calculator-spacing-production-desktop`, and
  `shipping-calculator-spacing-production-mobile`.

## July 23 Checkout Shipping And Artwork Form Release

- Objective: integrate calculated shipping into Stripe checkout, eliminate
  shipping-calculator layout movement, and make the owner Artwork Facts form
  production-grade.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Source commits: `77c6c84` and `5e15e22`, both pushed to origin.
- Canonical shipping calculations now live in `shared/shipping.ts` and are
  recomputed from trusted artwork data inside Convex. Checkout supports U.S.
  and international delivery, shows the exact itemized shipping contribution,
  adds it to the Stripe total, and routes oversize work to a studio quote.
- `/shipping` always shows size, framing, surface, and route factors. The
  previous result remains visible during the 450 ms recalculation. Reserved
  status, explanation, and factor-row dimensions eliminate visible movement.
- Artwork Facts uses shared client/server validation with required,
  publish-required, recommended, and optional states. Public Status now sits
  beside Medium on desktop; inline feedback, a form summary, focus-on-error,
  character limits, and exact Publish Check guidance are included.
- React Hook Form was not added. The editor already uses controlled state for
  live preview, readiness, unsaved-change protection, and listing status;
  shared validation at both trust boundaries provides the robustness without
  a competing state layer.
- Verification passed: Prettier, `git diff --check`, typecheck, lint, all 88
  tests, and the optimized production build.
- Production Convex `hushed-crane-268` and development Convex
  `laudable-flamingo-85` were deployed before the frontend.
- Final Vercel deployment `dpl_4q1hXSUpgfen1AoqWQZPb1uETQJP` is ready and
  aliased to `https://www.jwsfineart.com`.
- Production checkout QA on artwork `#103`: $495 artwork + $55 U.S. shipping =
  $550; international shipping is $200 and total is $695. No Stripe session or
  payment was created.
- Shipping QA: desktop result height varied by less than one pixel; final
  mobile result height was exactly `886.8828125px` before, during, and after
  recalculation. Both breakpoints had zero horizontal overflow.
- Authenticated admin QA on artwork `#89` confirmed field hierarchy, same-row
  Medium/Public Status desktop layout, responsive mobile stacking, warning to
  error promotion when Available is selected, and no horizontal overflow.
  The page was reloaded without saving, so production artwork was unchanged.
- Production browser diagnostics had no errors. The known Clerk
  development-key warning remains a separate configuration risk.
- QA evidence: `_context/checkout-shipping-artwork-form-production-qa.md`.
- Production preview aliases:
  `shipping-calculator-stable-production-desktop`,
  `shipping-calculator-stable-production-mobile`,
  `checkout-shipping-production-desktop`,
  `checkout-shipping-production-mobile`,
  `admin-artwork-facts-production-desktop`, and
  `admin-artwork-facts-production-mobile`.

## July 23 Media Manager Drag And Reorder

- Objective: extend the centered artwork media manager with modal-wide image
  file drop and persistent reordering for supporting and process images.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Source commit `41510b9` is pushed to
  `origin/feat/full-site-overhaul`.
- Primary remains fixed first. Supporting images reorder only within Supporting;
  process images reorder only within Process.
- Cards support pointer drag/drop and explicit earlier/later controls. Each
  reorder is saved immediately through a new atomic Convex mutation using the
  full ordered group ID list.
- The existing uploader now accepts image file drops anywhere within the media
  modal and exposes a clear modal-wide drag-over state.
- Automated verification passed: Prettier, `git diff --check`, typecheck, lint,
  all 81 tests, and the Node 24 production build.
- Local authenticated visual QA is unavailable because the local Clerk
  environment redirects to `/not-authorized`.
- Production `hushed-crane-268` and development `laudable-flamingo-85` Convex
  deployments were updated before the frontend.
- Vercel deployment `dpl_BGQzUGbEai7ey13oBNcqmh7GY8sr` is ready and aliased to
  `https://www.jwsfineart.com`.
- Authenticated production QA passed at `1440 × 1000` and `390 × 844` using
  artwork `#103`, which has five supporting images. Primary was non-draggable,
  all supporting cards were draggable, boundary controls disabled correctly,
  modal-wide upload guidance was present, internal scrolling worked, and
  neither viewport had horizontal overflow.
- QA did not upload, delete, reorder, or save production artwork data. Ordering
  semantics and Convex persistence are covered by automated tests.
- The production console reported no errors.
- Detailed evidence:
  `_context/admin-media-manager-reorder-production-qa.md`.
- Preview aliases: `admin-media-manager-reorder-production-desktop` and
  `admin-media-manager-reorder-production-mobile`.
- Artifact validation passed with 49 design artifacts, 76 preview QA artifacts,
  and 31 analysis records.
- The temporary viewport was reset and the browser session was finalized.

## July 23 Shipping Calculator Redesign

- Objective: improve `/shipping` calculator layout, dimension spacing,
  calculation feedback, fee transparency, and international planning.
- Source commit `9a6a07c` is pushed to
  `origin/feat/full-site-overhaul`.
- Calculator now groups artwork dimensions, U.S./international destination, and
  protection choices; uses properly inset `in` suffixes; and itemizes the base
  size range plus framed, delicate/glazed, and international adjustments.
- International estimates add a size-tiered route range and disclose that
  destination duties, taxes, and brokerage are separate.
- Every input change shows an accessible `Recalculating` state, dims the prior
  result, and animates a two-pixel progress rule before publishing the updated
  estimate after 450 ms.
- Local QA passed at `1440 × 1000` and `390 × 844`: the full four-factor range
  updated to `$185–$380`, transition state exposed `aria-busy="true"`, input
  suffix inset measured `18px` with `62px` reserved input padding, and page
  horizontal overflow was `0px`.
- Prettier, `git diff --check`, typecheck, lint, all 78 tests, and the Node 24
  production build passed.
- Vercel deployment `dpl_H2YMah9Z9A5rQsSzDxc4nizZUXKv` is ready and aliased to
  `https://www.jwsfineart.com`.
- Production desktop/mobile visual and DOM QA passed. The complete example
  remained `$185–$380`, mobile touch targets measured `56–76px`, and neither
  breakpoint had horizontal overflow. The production console reported no
  errors.
- QA evidence: `_context/shipping-calculator-production-qa.md`.
- Preview aliases: `shipping-calculator-production-desktop`,
  `shipping-calculator-production-desktop-international`, and
  `shipping-calculator-production-mobile`.
- Artifact validation passed with 49 design artifacts, 74 preview QA artifacts,
  and 29 analysis records.
- Final context commit `2cc3066` is pushed. The temporary browser viewport was
  reset and the browser session was finalized.
- User screenshot alias: `shipping-calculator-before`.

## July 23 Artwork Editor Guidance And Media Modal

- Listing state is now the compact first sidebar panel.
- Publish check explicitly names and explains only the incomplete essentials,
  links each one to the relevant editor field, and summarizes completed items
  separately.
- Search preview now renders a realistic search-result card using the public
  metadata fallback and separate story-improvement guidance.
- Manage media now opens an accessible, centered overlay on `/admin/edit`
  containing current-media review/removal and the existing upload/review flow.
  The legacy media route remains available.
- Implementation commit `69f93bf` plus visual-QA fixes `a9c95b2` and
  `c2fc12a` are pushed to `origin/feat/full-site-overhaul`.
- Final Vercel deployment `dpl_3NrMQVcww2XTakhASvjuqxyWLH4U` is ready and
  aliased to `https://www.jwsfineart.com`.
- Prettier, typecheck, lint, all 76 tests, a Node 24 production build, and the
  Vercel build passed.
- Authenticated production QA passed at `1440 × 1000` and `390 × 844`: no
  horizontal overflow or clipped sidebar content; correct panel order and two
  explicit missing items; modal focus, Escape/button close, background lock,
  internal scrolling, responsive gutters, and thumbnail containment.
- QA did not upload, remove, edit, or save production artwork data.
- Detailed evidence:
  `_context/admin-artwork-editor-guidance-and-media-qa.md`.
- Preview aliases:
  `admin-artwork-editor-sidebar-production-desktop`,
  `admin-artwork-editor-sidebar-production-mobile`,
  `admin-artwork-editor-media-modal-production-desktop`, and
  `admin-artwork-editor-media-modal-production-mobile`.
- Temporary browser emulation was cleared and the browser session was
  finalized.

## July 23 Select And Filter Polish

- Source commit `a5e0a6c` is pushed to `origin/feat/full-site-overhaul`.
- Vercel deployment `dpl_Ce8iUU7ecp48tym6HHfXppse5NhY` is ready and aliased
  to `https://www.jwsfineart.com`.
- All single-select controls in the public and owner shells now use a shared
  inset chevron with `48px` of reserved right padding.
- The Work filter popover now has clearer hierarchy, live match feedback, a
  descriptive framed-work control, active-filter status, and a reset action
  that preserves unrelated query parameters.
- Prettier, typecheck, lint, all 76 tests, and a Node 24 production build
  passed.
- Production browser QA passed at desktop and a real `390 × 844` mobile
  viewport. The mobile page had no horizontal overflow; the panel stayed
  within the viewport; filter apply/reset behavior passed; and authenticated
  owner selects had the same computed chevron and padding contract.
- QA evidence:
  `_context/select-and-filter-polish-production-qa.md`.
- Preview aliases:
  `work-filters-panel-production-desktop`,
  `work-filters-panel-production-mobile`, and
  `app-select-caret-spacing-production-mobile`.
- The temporary browser emulation was cleared and the browser session was
  finalized.

- Objective: continue the July 23 production polish after session
  `019f3504-d23b-7733-8e30-681f2c981fae`, including the landing regressions and
  the follow-up `/admin/homepage` artwork-library card layout.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Starting source commit: `4345f60`
- Completed source commit: `e7b727c`
- Full handoff: `_context/PROJECT_HANDOFF.md`
- Session reconstruction: `_context/SESSION_CONTINUATION_019F3504.md`
- Production: `https://jwsfineart.com`
- Convex production: `https://hushed-crane-268.convex.cloud`
- Data safety: Convex is active; Neon remains a read-only backup.

## Current Change

- Follow-up: moved each artwork-library Add action below the title and medium so
  both text rows use the complete content column. Both rows now truncate with
  ellipses and expose their full values through native hover tooltips.
- Fixed the collection-card black gutters by limiting the absolute label rule to
  `.lw-collection-card-label`; it had also matched the progressive-image wrapper
  and inset the artwork by `24px 24px 22px`.
- Restored first-slide reveal by withholding `is-revealed` until the progressive
  image reports ready. Added a nine-second subtle Ken Burns animation to revealed
  current and incoming hero images.
- Removed the five-artwork limit from the public query, server read, carousel,
  owner read/mutation, and `/admin/homepage`. The dot rail now scrolls for long
  rotations.
- Added a Convex test proving six artworks can be published and returned.

## Verification And Deployment

- Formatting, typecheck, lint, focused tests, and the full 76-test suite passed
  before continuation.
- Production Convex and the configured development Convex deployment were
  updated successfully on July 23, 2026.
- A production Next.js build passed under Node `v24.18.0`.
- Commits `7b5c6a9` and `cdf66c2` were pushed to
  `origin/feat/full-site-overhaul`.
- Vercel production deployment `dpl_Hqv9GXok1MFmhF4ViQJWqFtfSYs7` is ready and
  aliased to `https://www.jwsfineart.com`.
- Desktop `1440 × 1000` and mobile `390 × 844` browser QA passed. Collection
  wrapper gaps measured `0px` on every edge, the first hero transitioned from
  opacity `0` to `1`, its nine-second Ken Burns transform advanced over time,
  and neither breakpoint had horizontal page overflow.
- Authenticated `/admin/homepage` QA added a sixth artwork in unsaved client
  state, observed `6 selected` with Publish enabled, then reloaded without
  publishing. Production data was not changed.
- Detailed evidence: `_context/landing-regressions-production-qa.md`.
- Artifact aliases:
  `collection-card-borders-fixed-production-desktop`,
  `collection-card-borders-fixed-production-mobile`,
  `hero-motion-fixed-production-desktop`, and
  `hero-motion-fixed-production-mobile`.
- Artifact validation passed with 44 design artifacts, 62 preview QA artifacts,
  and 17 analysis records. The temporary browser viewport was reset and the
  browser session was finalized.
- Commit `e7b727c` passed formatting, typecheck, lint, and a Node 24 production
  build before push.
- Vercel deployment `dpl_Dv8vUA6Eox3Vis6njKApstfsAnGk` is ready and aliased to
  production.
- Authenticated production QA passed at `1440 × 1000` and `390 × 844`.
  Metadata and Add widths match, the action sits below both text rows, title and
  medium share the ellipsis contract and full-value tooltips, and neither
  breakpoint has page-level horizontal overflow.
- Follow-up evidence:
  `_context/admin-homepage-library-card-layout-qa.md`.
- Follow-up artifact aliases:
  `admin-homepage-library-add-row-before`,
  `admin-homepage-library-add-row-production-desktop`, and
  `admin-homepage-library-add-row-production-mobile`.
- QA analyses were saved into both follow-up previews. Artifact validation
  passed with 45 design artifacts, 64 preview QA artifacts, and 19 analysis
  records.
- The temporary viewport was reset and the authenticated browser session was
  finalized.
- Follow-up implementation, deployment, and production QA are complete.

## Known Separate Risk

- Production Clerk emits a development-key warning. Fixing that requires the
  intended Clerk production instance/keys plus coordinated Convex issuer and
  Vercel configuration. Never record key values.

## July 23 Artwork Release Date And Manual Sale Follow-up

- Objective: let the artist mark an artwork sold outside Stripe, record its
  original public release date, and use that date for newest-first ordering.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Source commits: `4c2e017`, `a2a29f7`
- Added optional Convex `artworks.releasedAt` storage and owner/public
  projections. Existing undated records are preserved without fabricated
  release dates.
- The editor now exposes `Sold — manual or external sale` and a themed
  Radix/DayPicker release-date control with month/year navigation, future-date
  prevention, local `Use today`, validation, and mobile viewport containment.
- Public `Newest` sorting and the homepage available-work selection use
  `releasedAt`; explicit releases sort first and undated legacy records remain
  last with ID as the deterministic fallback.
- Verification passed: full ESLint, TypeScript, 16 test files / 94 tests,
  `git diff --check`, and two final webpack production builds.
- Convex production `hushed-crane-268` was deployed successfully.
- Final Vercel production deployment:
  `dpl_CCwPud1SdGiSabvC7P8f7iS4N7MM`, ready and aliased to
  `https://www.jwsfineart.com`.
- Authenticated production QA passed at `1440 × 1000` and `390 × 844` without
  saving artwork changes. All three editor controls are 48 px tall, the
  calendar stays inside both viewports, future days are disabled, manual-sale
  selection works, and page-level overflow is zero.
- The public collection hydrated with 71 works and `Newest` selected. Existing
  production records are currently undated and therefore retain their legacy
  fallback order until the artist assigns release dates.
- Detailed evidence: `_context/ARTWORK_RELEASE_SOLD_QA.md`.
- Artifact aliases:
  `artwork-release-sold-production-desktop` and
  `artwork-release-sold-production-mobile`.
- Artifact validation passed with 60 design artifacts, 109 preview QA
  artifacts, and 48 analysis records.
- The local development server was stopped, the temporary browser viewport was
  reset, and the production browser session was finalized.

## July 23 Owner Form System And Collection Motion Follow-up

- Objective: align the owner artwork form through one shared row/footer system,
  clarify and normalize compact Instagram share references, use the real search
  icon, stack editor fields on mobile, and match category-card image motion to
  the public artwork cards.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Implementation and local QA are complete. Shared form rows align label,
  48 px control, and footer tracks; affected mobile fields and category choices
  stack full width without horizontal overflow.
- Instagram input accepts only `?igsh=...` references, documents the expected
  value, and reduces a pasted full Instagram URL automatically.
- Search preview now uses `/logo/JWS_ICON_260.png`.
- Homepage collection images retain the shared 280 ms reveal and now reach the
  shared `scale(1.018)` hover/focus transform over 500 ms.
- Development Convex had no explicit homepage rotation and therefore returned
  the 69-work legacy fallback while production returned five. The production
  rotation IDs `[70, 53, 69, 39, 58]` were synchronized into development
  through the authenticated owner mutation. Localhost now renders `01 / 05`.
- Full TypeScript, ESLint, 16 files / 97 tests, Node 24 production build, and
  local browser QA passed.
- Fable review was attempted but rejected by the service usage limit before it
  read any files.
- Detailed evidence:
  `_context/OWNER_FORM_COLLECTION_MOTION_QA.md`.
- Source commit `a9e527e` is pushed to `feat/full-site-overhaul`.
- Vercel deployment `dpl_8ZXk5CEPE5evrzrm3aieg5pMW4aK` is ready and
  aliased to `https://www.jwsfineart.com`.
- Production homepage QA confirmed the five-work `01 / 05` hero, three
  collection cards, no horizontal overflow, the shared 280 ms reveal / 500 ms
  transform timing, and `scale(1.018)` on hover.
- Authenticated production editor QA confirmed equal label, control, footer,
  and field geometry across the shared form rows. Search preview uses the real
  28 px production icon.
- Production artifact aliases:
  `home-collection-animation-production-desktop`,
  `owner-form-system-production-desktop`, and
  `owner-search-preview-logo-production-desktop`.
- Final artifact validation passed with 65 design artifacts, 115 preview QA
  artifacts, and 54 analysis records.
## July 31 Editorial Photo Refresh

- Objective: integrate the artist's supplied editorial photos across the public site, verify responsively, and deploy.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Assets: 13 originals staged under `_context/design-artifacts`; 12 curated WebP derivatives created under `public/editorial/artist` and `public/editorial/studio`.
- Decisions: IMG_0658 is the Studio lead portrait; process images form a purposeful timeline; near-duplicate portraits remain alternates; IMG_0593 original is not shown because its cleaned derivative already powers View at Scale.
- Implementation: the preferred IMG_0658 portrait leads `/studio`; 11 distinct supplied photos now support the homepage, Studio story and process sections, Commissions, and the Contact collector guide. The closely related IMG_0653 portrait remains a production-ready alternate. The cleaned IMG_0593 derivative continues to power View at Scale.
- Local checks passed: 125 tests, TypeScript, lint with one pre-existing `ResilientImage` warning, and the Node 24 production build.
- Desktop and 390 px mobile browser QA passed across `/`, `/studio`, `/commissions`, and `/contact`: no horizontal overflow, all editorial images decoded at appropriate responsive resolutions, and no runtime errors.
- Artifact links and UI-intention analysis were recorded; `agent-artifacts validate` passed with 93 design artifacts, 143 preview artifacts, and 59 analysis records.
- Next: commit/push, deploy to Vercel, and verify production.

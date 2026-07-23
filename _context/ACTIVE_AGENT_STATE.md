# Active Agent State

## July 23 Commerce Hardening And Shipping Release

- Objective: deny second purchases of one-of-one artwork, make Stripe webhook
  and email processing durable, release canceled reservations, add Stripe
  idempotency, finish endpoint configuration, and replace shipping with the
  artist-approved tier and pickup policy.
- Source commit `8134a73` plus the responsive shipping-label follow-up are on
  `origin/feat/full-site-overhaul`.
- Production Convex `hushed-crane-268` is deployed with the webhook inbox,
  notification outbox, retry/watchdog workers, delivery policy snapshots,
  pickup fulfillment states, and atomic second-sale prevention.
- Vercel deployment `dpl_EywmXd9p3hfHqRCWngbshHMEyD6X` is ready and aliased
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

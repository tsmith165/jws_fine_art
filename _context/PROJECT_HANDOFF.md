# JWS Fine Art Project Handoff

Last updated: 2026-07-23

This is the primary starting point for the next agent working on JWS Fine Art. It summarizes the current repository, production architecture, completed overhaul, migration history, deployment procedures, known risks, and immediate follow-up work.

Current code, `README.md`, and `_overhaul/CUTOVER_RUNBOOK.md` take precedence if this document ever conflicts with the repository. Older reports under `_context/` are historical evidence and may describe intermediate states that no longer apply.

## Executive Summary

JWS Fine Art is Jill Weeks Smith's production art portfolio, commerce, and studio-management site. The site was comprehensively rebuilt from the selected `d2 v1` wireframe direction, "The Lit Wall."

The current application uses Next.js 16, React 19, Tailwind CSS 4, Zustand, Convex, Clerk, UploadThing, Stripe, PostHog, Resend, and Vercel. Operational data was migrated from Neon to Convex. Neon remains an immutable, read-only backup and must not be modified or destructively re-imported without explicit user approval.

The public site and owner console are live at [jwsfineart.com](https://jwsfineart.com). The latest source branch is `feat/full-site-overhaul`, tracking `origin/feat/full-site-overhaul`.

The signed-in production verification of `/admin/homepage` is complete. Its
initial server error was traced to a Vercel/Convex deployment-order mismatch.
The missing production Convex schema and functions were deployed, and the
repaired page now passes add, remove, reorder, publish, restore, responsive
layout, console, and production-log checks.

## Repository And Deployment Coordinates

- Repository: `/Users/tsmith/dev/_codex/jws-fine-art`
- Current branch: `feat/full-site-overhaul`
- Handoff baseline commit: `b4b2108c677bebc2df745030d74b5573f2434c1a`
- Vercel project name: `jwsfineart`
- Vercel project ID: `prj_7f3meYKbFvjzCzDRkFG11E5WePsg`
- Vercel organization ID: `team_DI30MnuTgQscfbwshl73Gwlr`
- Likely Vercel scope: `tsmith-hobby`
- Production site: `https://jwsfineart.com`
- Production Convex deployment: `https://hushed-crane-268.convex.cloud`
- Stripe account: `acct_1If4C9D8CTpNeM29`
- PostHog project: `https://us.posthog.com/project/77162/web`

The private design-review application is a separate project:

- Repository: `/Users/tsmith/dev/_codex/jwsfineart-wireframes`
- Deployment: `https://jwsfineart-wireframes.vercel.app`
- Jill selected design `d2 v1`, "The Lit Wall," as the basis of the production overhaul.

## Completed Homepage-Rotation Verification

The repaired homepage-rotation owner page was verified in a signed-in production
browser session on 2026-07-23.

1. The page rendered instead of showing error digest `2794093951`.
2. The current rotation and eligible artwork loaded.
3. Remove, add, reorder, and publish behavior succeeded.
4. The exact original rotation was restored and republished.
5. Reloaded desktop and mobile layouts retained the restored state without
   page-level horizontal overflow.
6. The browser console contained no route/runtime error. It did reveal the
   separate Clerk development-key warning documented under Known Open Decisions
   And Risks.
7. A Vercel production error-log query returned no errors.
8. Passing desktop/mobile screenshots were linked to the incident artifact and
   `agent-artifacts validate` passed.

The incident screenshot is stored as:

- Alias: `admin-homepage-production-server-error`
- Artifact ID: `sha256:ae95cdb9fa8f4e139893d3d987e06e86abbb910a89192c051a74f148d6b7275f`
- Metadata: `_context/design-artifacts/sha256-ae95cdb9fa8f4e139893d3d987e06e86abbb910a89192c051a74f148d6b7275f/metadata.json`

Passing evidence:

- Desktop alias: `admin-homepage-production-fixed-desktop`
- Desktop artifact ID: `sha256:c0ed757a1bfdb6fd6110b4f29f7a5467e2c4ab406617ce8bd04b9055168b59ef`
- Mobile alias: `admin-homepage-production-fixed-mobile`
- Mobile artifact ID: `sha256:ee034581961f66c7f5fa18fe48b2f879d8074570e40773fda6a476bb5aa38884`

### Incident Root Cause And Repair

`src/app/admin/homepage/page.tsx` invokes `api.ownerReads.getHomepageRotation`. The Vercel frontend had been deployed before the corresponding Convex production functions and `homepageRotations` table/index. That backend/frontend drift caused the server-render failure.

The production Convex backend has now been repaired with:

```sh
pnpm exec convex deploy --typecheck enable --message "Deploy homepage rotation schema and functions"
```

The deployment added `homepageRotations.by_key` and deployed both:

- `ownerReads.js:getHomepageRotation`
- `ownerMutations.js:setHomepageRotation`

This was confirmed with `pnpm exec convex function-spec --prod`. No source edit remains for this incident. Do not reimplement the feature.

## Critical Deployment Rule

When a change adds or modifies a Convex schema, query, mutation, action, or generated API reference, deploy Convex before deploying Vercel:

```sh
pnpm exec convex deploy --typecheck enable --message "Describe backend change"
vercel --prod --scope tsmith-hobby
```

A frontend that references an undeployed Convex function can build successfully and then fail during production server rendering. This exact failure occurred on `/admin/homepage`.

For frontend-only changes, a normal production Vercel deployment is sufficient. Do not deploy a documentation-only change.

## Technology Stack

- Next.js 16.2.10 using the App Router
- React 19.2.7
- TypeScript
- Tailwind CSS 4
- Zustand 5 for client state where needed
- Convex 1.42.3 for operational data, server functions, and owner authorization
- Clerk for authentication and owner identity
- UploadThing for original artwork media uploads
- Stripe Checkout and signed Stripe webhooks for payments and order creation
- PostHog for privacy-limited production analytics and historical traffic reporting
- Resend for transactional and campaign email
- Vercel for hosting and production environment management
- pnpm 10.33.0
- Node.js 24.x

## Environment Variables

Never put values in documentation, chat, shared memory, or Git. The required variable names are:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `CONVEX_SERVER_WRITE_SECRET`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `UPLOADTHING_TOKEN`
- `RESEND_API_KEY`
- `UNSUBSCRIBE_SIGNING_SECRET`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `POSTHOG_PROJECT_ID`
- `POSTHOG_PERSONAL_API_KEY`
- `POSTHOG_API_HOST`
- Optional: `NEXT_PUBLIC_POSTHOG_CAPTURE_PREVIEWS=true`

`POSTHOG_PERSONAL_API_KEY` is server-only and must never have a `NEXT_PUBLIC_` prefix. The user intentionally configured it for Vercel Preview and Production, not Development. That is acceptable; local analytics pages will not have live PostHog reporting unless a development key is deliberately added.

Convex also requires the Clerk JWT issuer/auth configuration described in `convex/README.md` and the setup scripts.

Never use live Stripe credentials in local development or arbitrary preview environments.

## Local Setup And Verification

```sh
cd /Users/tsmith/dev/_codex/jws-fine-art
corepack enable
pnpm install --frozen-lockfile
pnpm exec convex dev --once
pnpm dev
```

Standard verification:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm audit --prod
```

Inspect `package.json` before choosing additional scripts. It contains Neon migration and audit commands, Clerk/Convex setup helpers, release audits, and focused test commands.

Do not leave a local dev server running when handing work back unless the user explicitly requests it. For production UI changes, the user prefers QA against the real deployment.

## Data Architecture And Migration Safety

### Convex Is The Active System

Convex is the source of truth for the current application. The production migration from Neon was completed, including artwork, primary and supporting media, statuses, dimensions, prices, categories, and legacy orders.

The production Convex deployment was backed up before migration work. Additive schema/functions were deployed, the category backfill updated 66 records, and a second dry run produced zero changes, confirming idempotence.

### Neon Is A Read-Only Backup

Neon was intentionally retained as a safety backup. Do not:

- Write to Neon.
- Delete Neon data.
- Re-run a destructive import.
- Treat an old migration report as permission to overwrite production Convex.
- Change a production schema or data policy without inspecting the cutover runbook.

Read `_overhaul/CUTOVER_RUNBOOK.md` before any data migration, production write, DNS, webhook, provider-secret, or cutover operation. The runbook is fail-closed and requires explicit approval at the relevant production gates.

### Canonical Artwork Categories

The migrated canonical categories are:

- Coastal
- Mountain
- Urban
- Intaglio & Lino Cut

Public homepage category cards intentionally show Coastal, Mountain, and Urban. The full Work page exposes the complete taxonomy.

### Important Convex Domains

The schema includes:

- `artworks`: legacy ID, slug, title, copy, category, availability/sold/active state, dimensions, price, gallery/homepage ordering, owner revision and mutation metadata.
- `artworkMedia`: primary/supporting/progress media, ordering, dimensions, storage/provider metadata.
- `homepageRotations`: keyed rotation configuration containing ordered artwork legacy IDs.
- Checkout intents, orders, order events, Stripe events, webhook quarantine, and owner audit events.
- Inquiries, subscribers, consent history, campaigns, and mailing data.

Inspect `convex/schema.ts`, `convex/ownerReads.ts`, `convex/ownerMutations.ts`, and the domain-specific Convex modules before modifying contracts.

## Public Routes

- `/`: dynamic artwork hero rotation, available-work introduction, category exploration, artist/story content, newsletter signup.
- `/work`: full browsable catalog. All Work is the default and first tab.
- `/work/[slug]`: canonical dynamic artwork details route.
- `/gallery`: compatibility/public gallery route.
- `/details` and `/details/[id]`: legacy-compatible detail routes.
- `/studio` and `/biography`: artist story and working-life history.
- `/commissions`: commission overview, examples, process, and inquiry path.
- `/contact`: collector and commission inquiry.
- `/shipping`: shipping details and non-binding estimator.
- `/faq`, `/events`, `/slideshow`, `/qr`, `/profile`.
- `/checkout/[id]`, `/checkout/success/[id]`, `/checkout/cancel/[id]`.
- `/unsubscribe`.
- `/signin`, `/sign-in`, and `/login` aliases.
- `/signout`, `/sign-out`, and `/logout` aliases.
- `/signup`.
- `/not-authorized`.

## Owner Console Routes

- `/admin`: dashboard with operational status, recent orders/inquiries, and PostHog activity.
- `/admin/artwork`: catalog management, search, instant filters, archive/restore.
- `/admin/categories`: Quick Categorize workflow. Archived artwork is excluded.
- `/admin/edit` and `/admin/edit/new`: artwork creation/editing.
- `/admin/edit/images/[id]`: artwork image management.
- `/admin/homepage`: dynamic homepage hero-rotation management.
- `/admin/orders`: sales and fulfillment management.
- `/admin/inbox`: collector inquiries.
- `/admin/mailing`: audience, campaigns, composer, and live preview.
- `/admin/analytics`: PostHog traffic and first-party operational reporting.
- `/admin/manage`: management compatibility route.
- `/admin/tools`: backups and site-health utilities.

Unauthenticated users must see the Not Authorized state without any owner-console shell or protected content flashing first.

## Completed Work

### Design System And Branding

- Rebuilt the production site around `d2 v1`, The Lit Wall.
- Implemented the JWS-only signature mark with "Jill Weeks Smith" and "Fine Art" lockup.
- Removed the obsolete gold divider line from the brand lockup.
- Made the public navigation sticky across desktop, tablet, and mobile.
- Updated footer branding to match the header.
- Added custom scrollbars appropriate to the dark palette.
- Kept artwork imagery unfiltered: no saturation filters, tinting, or destructive compression styling.

### Public Catalog And Artwork Details

- All Work is the default and first Work-page option.
- Added canonical category browsing and end-of-gallery category cards.
- Made artwork cards and category links route dynamically to the selected artwork.
- Implemented search, availability tabs, categories, filters, and sorting as working controls.
- Fixed portrait rendering, card aspect containment, and the duplicate/blurred side-fill regression.
- Improved loading behavior with stable image frames and browser/Next Image caching.
- Kept original-quality source media and explicit supported Next.js image quality settings.
- Implemented primary/supporting image carousel controls and supporting-image deletion.
- Added View at Scale room visualization on artwork details.
- Removed the 30-day return promise.
- Added shipping and artwork-care reassurance without promising unresolved rates.

### Homepage

- Added a Convex-backed dynamic hero rotation that updates without redeploying Vercel.
- Added `/admin/homepage` for authorized owners to add, remove, and reorder eligible artwork.
- The public page reads rotation data server-side to avoid a client-only loading flash.
- Hero/detail loading warms only high-value adjacent media instead of attempting to cache the entire catalog.
- Category exploration uses Coastal, Mountain, and Urban.
- Updated Jill-approved copy throughout the page.

### Image Performance Decision

Multiple Fable reviews reached the same conclusion: do not mirror the entire artwork catalog into IndexedDB or a service worker. That creates cache invalidation, quota, duplication, and stale-media risks while competing with the browser's optimized HTTP cache.

The implemented direction is:

- Use Next Image and immutable provider URLs.
- Reserve stable dimensions/aspect ratios to prevent layout shifts.
- Decode and transition images within a stable frame.
- Preload only critical hero imagery and adjacent carousel/detail images.
- Let browser HTTP caching handle repeat visits.
- Keep admin-configurable homepage data dynamic while server-rendering the selected image set.

### Studio And Biography

- Corrected Jill's portrait dimensions and source rendering.
- Updated practice and printmaking copy.
- Rebuilt "From the first brushstroke to the studio today" as a left-column timeline with vertically centered imagery on the right.
- Hid the timeline imagery at widths of 768px and below.
- Added the archived `small-event_1-inner` image to the public story about Jill showing work at galleries, art walks, and regional fairs.
- Added Jill's Fine Art major, Interior Design minor, commissioned silk-screen/print work, art docent work, and regional history.

### Commissions

- Reduced oversized hero typography and improved responsive wrapping.
- Updated the hero and supporting copy to Jill-approved language.
- Refined visual rhythm between alternating sections.
- Added commission examples, process, and inquiry path.
- Open content decision: the heading "Personal work, grounded in a real story." still exists. The user questioned it but has not supplied or approved a replacement.

### Shipping And Returns

- Added a separate shipping-information view and a non-binding dimension/care estimator.
- Current language reflects a damage-only refund stance.
- The site offers additional photographs or a special video on request.
- Shipping amounts remain provisional. Jill expects actual shipping to cost roughly $100-$150+ but may charge a simpler contribution such as $50.
- Stripe shipping charges were deliberately left unchanged pending Jill's final decision.
- Do not publish final rates, terms, or refund language without Jill/user approval.

### Authentication And Authorization

- Clerk-backed owner authorization is integrated with Convex.
- Protected admin routes fail closed.
- Unauthenticated users do not see an admin shell.
- Sign-in aliases remain available even for an already signed-in user, allowing logout/account-switch guidance.
- Sign-out aliases are also enabled.

### Uploads And Artwork Editing

- Fixed missing UploadThing token/environment configuration.
- Implemented production artwork creation, editing, categorization, status changes, archive/restore, media uploads, and media deletion.
- Added a normalized public-status selector to fix status persistence, including the reported "Swell" private-collection-to-available failure.
- Added explicit owner-facing write errors instead of swallowing server failures.
- Tested the production workflow through the UI by creating a temporary artwork, uploading media, editing details, assigning a category, saving, and deleting/restoring test state.
- Quick Categorize excludes archived records and uses a bounded, usable layout.

### Orders And Stripe

- Stripe CLI was authorized against account `acct_1If4C9D8CTpNeM29`.
- Checkout, signed webhook handling, order creation, and fulfillment state are implemented.
- Legacy orders were migrated and clearly identified.
- Orders and Recent Orders UIs were redesigned for hierarchy, alignment, buyer/date/amount/status scanning, and responsive behavior.
- Missing legacy thumbnails are handled safely.
- Webhook quarantine and event/audit records exist for failure inspection.

### Analytics And PostHog

- PostHog production history is queried with a server-only personal API key.
- The user saved the key in Vercel Preview and Production only.
- Admin analytics include visitors, page views, artwork detail views, pages per visitor, top paths, referrers, and period controls.
- Dashboard and full analytics views use charts with hover crosshair/tooltips.
- The explanatory "Data policy" block was removed from the owner UI.
- Historical data from the prior production site is available because the same PostHog project is queried.
- Browser capture runs only on production hostnames by default, excludes owner/auth routes, strips query strings, and disables broad autocapture/session recording in favor of explicit privacy-safe events.

### Mailing And Inquiries

- Added first-party subscribers, explicit consent, unsubscribe signing, and campaign drafts.
- Added mailing-list management and campaign composition.
- The email preview updates as the owner types.
- Improved empty/full-height campaign list behavior and composer/preview layout.
- Resend supports delivery; Convex owns audience, consent, and campaign records.

### Package, Security, And Cleanup Work

- Removed unused packages, duplicate files, and unused public assets after confirming scope.
- Upgraded dependencies and addressed reported vulnerabilities where compatible with the current application.
- Added private-repository documentation and a proprietary/non-open-source license notice.
- Added security headers and release/audit checks.

## Recent Commit History

The latest baseline commits are useful for locating recent changes:

- `b4b2108` Fix portrait gallery image placeholders
- `7785b92` Add editable homepage artwork rotation
- `05fb9cd` Optimize artwork image loading
- `ba10a69` Fix artwork publishing and media management
- `007bd9c` Refine commissions section typography
- `2e59efb` Refine commissions hero typography
- `c8263b6` Fix studio timeline layout
- `fcfbb2e` Exclude archived artwork from categorization
- `77ec703` Surface write freeze errors
- `6d0f6ca` Fix quick categorizer layout
- `80890e4` Add collection browse to work page
- `7b4ee0e` Fix public brand lockup
- `618659f` Implement Jill review updates and quick categorizer
- `11e7520` Handle missing order thumbnails
- `19e6e88` Allow legacy artwork image hosts

Inspect the full branch history and diff before assuming an old intermediate implementation still exists.

## Known Open Decisions And Risks

1. Production Clerk currently emits a warning that development keys are in use.
   Migrate deliberately to the intended Clerk production instance and coordinate
   its JWT issuer with production Convex before changing Vercel.
2. Jill must approve final shipping contribution, carrier/insurance language, damage reporting window, and final damage-only refund wording.
3. The commissions heading "Personal work, grounded in a real story." needs a copy decision if the user wants it changed.
4. Legacy data contains incomplete or test-looking records and old $1 orders. Do not delete or normalize them without explicit review.
5. Production write-path QA must preserve and restore Jill's real content.
6. Convex must always deploy before Vercel when frontend code references new backend functions.
7. Avoid broad image pre-caching in IndexedDB/service workers. The existing strategy is intentional.
8. Avoid saturation, blur, tint, or image filters on artwork. The artwork itself is the primary visual asset and should remain faithful to the uploaded original.

## OMP And Fable Records

The exact OMP job IDs, cursors, prompts, report paths, artifact aliases, and visual-analysis records are maintained in `_context/LOOP_RULES_AND_CONTEXT.md`. Do not relaunch completed jobs after compaction.

Notable completed analysis groups include:

- Layout architecture: `04c93750...`
- Visual review: `3ceb3a39...`
- Convex cutover: `68d1b1e2...`
- Upload analysis: `7776f912...`
- Commerce partial/failed review: `532e7302...`
- Admin reviews: `77226c76...`, `3450b859...`
- PostHog reviews: `a70016e8...`, `a4aa3fd0...`, `d3b4f898...`
- Jill feedback implementation reviews: `800410f0...`, `86bbc0cd...`, `69c3a8cd...`, `e6da5e13...`
- Image-cache reviews:
  - `bb8a48a6-a28b-4af7-99e1-92f751094abd`
  - `9f7c9f7b-c1ce-4325-b913-c084f41d862f`
  - `f587bd7e-539b-426f-9ff1-f263d231fb6f`
- Upload reliability reviews:
  - `442805da-566c-4cde-b612-ddc3175cf282`
  - `570eadb8-a6f0-499e-bbbe-241f4c59996a`

All image-cache and upload-reliability jobs completed successfully at cursor 6. Consult the loop-context file for full IDs and reports rather than relying on abbreviated IDs above.

When future OMP work is requested:

- Use `start_omp_batch` through the OMP MCP, never raw `omp`.
- Use exact model ID `anthropic/claude-fable-5`.
- Record job IDs, cursors, and report paths in `_context/LOOP_RULES_AND_CONTEXT.md`.
- Poll at a human cadence, generally every 30-60 seconds.
- Treat findings as advisory and verify locally.

## Visual Artifact Workflow

Screenshots and visual QA use `agent-artifacts`. Follow the installed `agent-artifacts` skill.

- User screenshots/design references: `_context/design-artifacts/`
- Deployed preview/production QA: `_context/preview-qa-artifacts/`
- Export OMP context with artifact directories rather than pasting image binaries.
- Link previews to design/incident artifacts.
- Save useful OMP visual analysis back to the artifact store.
- Run `agent-artifacts validate` before handoff.

The artifact stores were repeatedly validated during the overhaul. The loop-context file contains the current artifact counts and relationships.

## High-Value Files To Read First

1. `README.md`
2. `_context/PROJECT_HANDOFF.md`
3. `_context/ACTIVE_AGENT_STATE.md`
4. `_context/LOOP_RULES_AND_CONTEXT.md`
5. `_overhaul/CUTOVER_RUNBOOK.md`
6. `_overhaul/PLAN.md`
7. `convex/README.md`
8. `package.json`
9. `convex/schema.ts`
10. `convex/ownerReads.ts`
11. `convex/ownerMutations.ts`
12. `src/app/admin/homepage/page.tsx`

Use `rg` and `rg --files` to locate domain code. Do not assume path names from old reports remain accurate.

## New-Agent Startup Checklist

1. Read this document, `README.md`, the cutover runbook, and the current active-agent state.
2. Run:

   ```sh
   cd /Users/tsmith/dev/_codex/jws-fine-art
   git status --short --branch
   git log -10 --oneline
   ```

3. Preserve unrelated user changes. Do not reset, revert, or clean files you did not create.
4. Read `_context/SESSION_CONTINUATION_019F3504.md` for the completed
   `/admin/homepage` verification and the Clerk production-key follow-up.
5. If a Convex contract changes, deploy Convex before Vercel.
6. Run focused checks during development and the full verification set before release.
7. Commit and push code changes by default unless the user explicitly says not to.
8. For production UI changes, deploy and verify the real deployment. Stop local servers before handoff.
9. Use browser/computer-use tooling for real workflows, not only static code inspection.
10. Restore production data after test writes.

## User Preferences And Working Rules

- Code changes should be committed and pushed as part of completion unless explicitly kept local.
- Production-facing changes should be deployed and tested on the real site.
- Do not leave local preview/dev servers running when production QA is requested.
- Preserve image fidelity and avoid decorative filters that alter artwork.
- Treat visual polish, spacing, responsive behavior, and copy as first-class requirements.
- Use working mocks and real interactions rather than static controls.
- Confirm destructive removals before deleting features, data, or meaningful assets.
- Use OMP/Fable for broad analysis when requested, but keep final judgment, edits, Git, deployment, and QA with Codex.
- Use `agent-artifacts` for screenshots and visual QA evidence.
- Be especially careful with Jill's production artwork, orders, subscribers, and homepage rotation.

## Handoff Status

At the continuation baseline, the application source was already in production.
The homepage-rotation Convex backend repair and authenticated browser
verification are complete. The exact original rotation was restored after
testing. The next operational risk is the production Clerk development-key
warning; changing it requires coordinated Clerk, Convex, and Vercel
configuration.

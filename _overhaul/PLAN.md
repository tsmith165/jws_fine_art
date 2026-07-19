# JWS Fine Art Overhaul Ledger

This ledger is the plan of record for the production-site overhaul. It is updated at every phase boundary and whenever a material decision changes.

## Current State

- Branch: `feat/full-site-overhaul`
- Baseline commit: `be3b821`
- Draft PR: `https://github.com/tsmith165/jws_fine_art/pull/56`
- Target design: `d2 v1` (The Lit Wall) from `/Users/tsmith/dev/_codex/jwsfineart-wireframes`
- Production data policy: Neon remains read-only and intact as the backup source.
- Current phase: 8 of 8 verified for branch preview. The Lit Wall public site and owner console are implemented against Convex, the superseded runtime stack has been removed, all local release gates pass, and the final Vercel preview has passed public desktop/mobile QA. Production deployment, authenticated owner mutation QA, and live-provider cutover remain explicitly unexecuted pending approval and appropriate test accounts.
- Production release policy: preview deployments are allowed for QA; production deployment, DNS changes, and production write cutover require explicit approval.

## Safety Invariants

1. Neon is read-only for the entire overhaul. No script, application path, or manual command may write to it.
2. Every source row from all five Neon tables is preserved verbatim in immutable raw Convex tables with source table and numeric ID. Canonical operational records are derived separately; anomalies are represented, not silently corrected.
3. Convex read cutover and write/commerce cutover are independent gates with separate rollback procedures.
4. Existing media URLs remain canonical during the initial migration. Asset re-hosting is a separate, reversible decision.
5. New commerce state is authoritative only after Stripe and Convex agree. Client input and Stripe metadata are not trusted for price or availability.
6. Public artwork output never exposes owner-only, order, inquiry, subscriber, or migration fields.
7. Production application behavior does not change until the branch has passed production-build and preview QA.

## Phases

### Phase 1: Inventory and Baseline

Status: **verified**

Acceptance criteria:

- [x] Record every application route and its public, commerce, authentication, or owner-console role.
- [x] Record package versions, known vulnerabilities, unused dependencies, and justified upgrade targets.
- [x] Record the complete Neon schema, relationships, row counts, nullability, source anomalies, and UI-dependent fields without modifying Neon.
- [x] Record where image assets live, how URLs are formed, and representative resolution and availability checks.
- [x] Record the complete `d2 v1` design surface and map each real route to its target screen or an explicit extension.
- [x] Capture baseline typecheck, lint, production build, package audit, browser behavior, accessibility, performance, and image-payload measurements.
- [x] Create a full custom-format Neon dump and schema snapshot outside the repository with restrictive permissions and recorded checksums.

Evidence:

- `_overhaul/INVENTORY.md`
- `_overhaul/BASELINE.md`
- Backup details in the Migration Record below.

### Phase 2: Reviewed Plan of Record

Status: **verified**

Acceptance criteria:

- [x] Write the implementation sequence, rollback boundaries, measurable optimization targets, and verification matrix.
- [x] Complete independent architecture, migration, security/commerce, and product/UX critiques.
- [x] Verify critique claims against the current code and revise the plan for confirmed failure modes.
- [x] Complete a migration-only second review covering identity, raw/canonical separation, assets, idempotency, delta import, and rollback.
- [x] Commit and push the reviewed plan before application implementation begins.

### Phase 3: Convex Foundation and Deterministic Migration

Status: **verified**

Acceptance criteria:

- [x] Provision only a free development/preview Convex project and record non-secret identifiers. Stop if provisioning requires payment.
- [x] Add Convex, Vitest, schema validation, and generated types without changing production reads or writes.
- [x] Define immutable raw tables for `Pieces`, `ExtraImages`, `ProgressImages`, `PendingTransactions`, and `VerifiedTransactions`, plus separate canonical operational tables with source identity, indexes, authorization boundaries, and no fabricated historical timestamps.
- [x] Export Neon through a deterministic, read-only script with per-table hashes and PII-safe reports.
- [x] Import all source rows idempotently in dependency order and produce an explicit reconciliation report for every anomaly.
- [x] Import the same snapshot twice with no duplicate or divergent documents.
- [x] Import a synthetic newer snapshot/delta and prove deterministic upsert behavior, conflict protection for owner-mutated canonical fields, and explicit `absentFromSource` handling without deleting raw rows.
- [x] Prove count, source-ID, field-hash, null/empty, relationship, status-combination, and media parity.
- [x] Check all 481 operational artwork URLs and all three transaction-only legacy URLs; preserve the currently unavailable transaction snapshot without promoting it to canonical artwork media.
- [x] Restore the Neon dump into a disposable isolated PostgreSQL database, compare source counts, and stop only that disposable database.
- [x] Keep all application reads and writes on Neon throughout this phase.

Rollback boundary:

- Remove or recreate only the new development Convex deployment and migration outputs. Neon and production remain unchanged.

### Phase 4a: Reversible Convex Read Cutover

Status: **verified**

Acceptance criteria:

- [x] Introduce a thin server-side read adapter for public and owner read contracts. Do not retrofit a large dual-backend repository around legacy UI.
- [x] Keep public routes server-rendered and free of the Convex WebSocket client unless a route needs live interaction.
- [x] Switch local and preview reads to Convex through explicit environment configuration while writes remain on Neon. An unset or unrecognized backend value must fail safe to Neon; Convex requires an exact opt-in value.
- [x] Prove contract parity for artwork lists, artwork detail/media, owner catalog, legacy transactions, and site-content reads.
- [x] Exercise every existing public and owner read surface against a production build.
- [x] Record the exact read rollback procedure and verify it on the same commit by rebuilding once with the backend variable removed.

Evidence:

- `_overhaul/reports/PHASE_4A_READ_CUTOVER_VERIFICATION.md`

Rollback boundary:

- Flip the preview read backend to Neon and rebuild. No production writes have moved.

### Phase 4b: Convex Writes, Owner Mutations, and Commerce

Status: **verified**

Acceptance criteria:

- [x] Centralize Clerk owner authorization in one helper used by Next route handlers, UploadThing callbacks, and every private Convex function. Owner claims must come from the verified Clerk-to-Convex JWT, not a Convex-side Clerk API call.
- [x] Implement Convex mutations for artwork facts, media metadata/order, visibility/order, content settings, inquiries, subscribers, simple campaign drafts/sends, fulfillment state, and maintenance jobs.
- [x] Create server-side checkout intents and persist them atomically from current canonical artwork state; reject sold, inactive, unavailable, or non-positive-price purchases.
- [x] Implement one canonical order per Stripe payment intent with transactional idempotency, immutable purchase snapshots, append-only events, and persisted Stripe event IDs.
- [x] Derive paid amount from Stripe `amount_received` or the trusted checkout-intent snapshot, never client input or replayed metadata.
- [x] Verify create/edit/archive/restore/upload/reorder, inquiry, subscription, campaign draft/send, checkout, replayed webhook, legacy-shaped unknown-intent webhook quarantine, failed email, cancellation, and recovery behavior in the in-memory Convex runtime. Real provider boundaries remain in the preview gate.
- [x] Keep raw imported pending/verified rows separate from canonical new orders. Honest legacy labeling is an explicit Phase 6 owner-UI acceptance item rather than a data-cutover blocker.
- [x] Verify deployed Convex public reads, canonical checkout state, and owner authorization boundaries in a Vercel branch preview. Live Stripe, Resend, UploadThing, and authenticated owner side effects remain in the final test-key preview gate; no live provider event was created.
- [x] Document the production write-freeze, open Stripe Checkout Session expiration or 24-hour drain, retry-backlog drain, fresh Neon backup, bidirectional final delta, parity re-proof, Stripe webhook transition, and sign-off checklist without executing it.
- [x] Document asymmetric post-cutover rollback through a restored PostgreSQL copy, never by silently writing to original Neon. Export and reconcile all Convex-only writes, sold state, and payment-intent dedupe records before checkout can return to the legacy stack.

Rollback boundary:

- Before production approval, production still writes to Neon. The branch can revert to the Neon implementation. After an approved production write cutover, rollback requires a Convex delta export and explicit reconciliation.

Evidence:

- `_overhaul/reports/PHASE_4B_WRITE_COMMERCE_VERIFICATION.md`

### Phase 5: Tailwind CSS v4 and Deliberate Client State

Status: **verified**

Acceptance criteria:

- [x] Upgrade Tailwind/PostCSS to v4 and encode the Lit Wall tokens in CSS-first theme variables.
- [x] Preserve build behavior and route usability through targeted smoke QA; pixel parity with the legacy skin is not required because Phase 6 replaces it.
- [x] Name and record the revert commit before public redesign work begins.
- [x] Use URL state for catalog filters/sort/search and React state for local controls.
- [x] Keep Zustand only if a real cross-route client state survives product implementation. Do not mirror Convex or URL state.
- [x] Pass typecheck, lint, tests, production build, and desktop/mobile smoke QA.

Evidence:

- `_overhaul/reports/PHASE_5_TAILWIND_V4_VERIFICATION.md`
- Revert commit: `b6777b2`

### Phase 6: `d2 v1` Product Implementation

Status: **verified**

Acceptance criteria:

- [x] Implement the Lit Wall public Home, Work, Artwork, Studio & Story, Commissions, Contact & Collector Guide, Checkout, confirmation/cancel, error, and not-found surfaces with real data.
- [x] Implement the Lit Wall owner Dashboard, Catalog, Artwork Editor, Orders, Inbox, Mailing & Campaigns MVP, Analytics, and Tools surfaces with real operations.
- [x] Make search, availability, faceting, sorting, selected-artwork routing, image navigation, 2D room visualization, forms, upload, and owner workflows functional.
- [x] Use real links and semantic controls. Preserve middle-click, keyboard, screen-reader, reduced-motion, pause, and focus behavior.
- [x] Match the reviewed `d2 v1` hierarchy, charcoal/ivory/brass palette, typography, fixed app bars, and artwork-first presentation across desktop and mobile.
- [x] Keep artwork at opacity 1 with `filter: none`; readability treatment uses separate scrim layers and must not alter the image element.
- [x] Render description-less works with honest facts-only content. Do not generate fictional artwork stories.
- [x] Expose real catalog gaps through owner needs-attention and publish-check rules; do not copy synthetic wireframe analytics or counts.
- [x] Implement Mailing MVP as consent/suppression, subscriber list, simple draft/preview/send, and provider outcomes. Defer segmentation, scheduling, and a full ESP workflow.
- [x] Verify every route and meaningful safe state against a production build with screenshots plus DOM/layout, console, and failed-network evidence. Authenticated owner mutations and live-provider side effects are separately deferred and recorded because the controlled preview session has no owner identity and the release policy forbids real side effects.

Progress:

- The canonical Lit Wall public routes, slug-based artwork detail, real-data catalog controls, image gallery, room visualization, inquiry/newsletter forms, commissions, studio story, contact guide, and server-authoritative Stripe checkout states are implemented and pass preview browser verification.
- The shared owner console now covers Today, Artwork, Orders, Inbox, Mailing, Analytics, and Tools with real Convex data and mutations. The artwork editor, new-piece workflow, and media uploader use the same shell, preserve original uploads, expose publish checks, and pass typecheck, lint, tests, and a production build.
- The final preview passed desktop and mobile public-route QA, carousel and room-view interaction checks, 390-pixel DOM overflow checks, current-runtime exception inspection, and unauthenticated owner-boundary verification. Authenticated owner mutation QA remains a named production-readiness gate rather than being bypassed.

### Phase 7: Optimization, Security, Accessibility, and Discoverability

Status: **verified**

Acceptance criteria:

- [x] Resolve actionable package and application security findings without hiding remaining risk.
- [x] Meet or explain the public performance targets below using before/after Lighthouse reports with identical profiles. All score targets pass except preview SEO, which is intentionally reduced by Vercel's preview `X-Robots-Tag: noindex`; Home mobile LCP measures 3.54 seconds, effectively at but not strictly below the 3.5-second target.
- [x] Preserve originals, generate responsive derivatives from originals once, validate dimensions/orientation metadata, retain the original color-profile source, and avoid repeated lossy transforms. The application stores the original UploadThing object without client canvas recompression and validates server-side metadata with Sharp. A live HEIC or embedded-profile upload was not triggered during preview QA.
- [x] Load only the active hero slide eagerly; use accurate `sizes`, bounded hero selection, route-level caching, and minimal root providers.
- [x] Implement redirects, canonical URLs, metadata, dynamic sitemap, robots policy, Open Graph, and accurate artwork JSON-LD.
- [x] Keep sold artwork indexable as archive records and omit `Offer` data for sold or non-positive-price records.
- [x] Add security headers, input validation, rate limits/abuse controls, webhook signature/replay tests, and PII-safe logging.
- [x] Verify keyboard navigation, focus visibility, semantic landmarks, contrast, labels, reduced motion, screen-reader paths, and mobile touch targets locally; deployed verification remains part of the final gate.

Measured targets:

- Home mobile Lighthouse performance at least 85 and LCP below 3.5 seconds.
- Work mobile Lighthouse performance at least 85 and LCP below 3.5 seconds.
- Home and Work desktop Lighthouse performance at least 95.
- Accessibility, best practices, and SEO at least 95 on Home, Work, Artwork, and Checkout where Lighthouse scoring applies.
- No layout shift above 0.05 on key public routes.
- No critical/high production dependency advisories and no untriaged moderate production advisories.
- No console errors or failed first-party requests in the tested happy paths.

### Phase 8: Old-Stack Removal and Final Verification

Status: **verified**

Acceptance criteria:

- [x] Remove Neon, Drizzle, PostgreSQL, and legacy transaction code from application paths after the reversible preview cutover window.
- [x] Remove verified dead packages/files, obsolete migrations/configuration, orphaned styles, unused components, and superseded implementations. Intentional compatibility redirects remain for indexed legacy URLs.
- [x] Preserve the external Neon dump, schema snapshot, deterministic export/import tooling, migration reports, and rollback documentation.
- [x] Pass a clean install, typecheck, lint with zero warnings, tests, production build, production dependency audit, asset verification, and full safe browser QA.
- [x] Create a Vercel preview deployment and verify public flows plus the owner authentication boundary there. Do not deploy production. Authenticated owner mutations remain deferred because no owner session was available and bypassing authorization was not acceptable.
- [x] Record before/after performance, bundle, route, and asset evidence; complete all ledger checkboxes; state known limitations plainly.
- [x] Push the completed branch and update the single draft PR with the final branch-level description. Do not merge.

## Canonical Data Decisions

### Raw preservation and canonical operations

- `legacyPieces`, `legacyExtraImages`, `legacyProgressImages`, `legacyPendingTransactions`, and `legacyVerifiedTransactions` preserve source values verbatim. Raw nullable booleans remain tri-state even though the July 17 production snapshot contains zero null status flags.
- `artworks` stores the operational artwork record plus `legacyTable = "Pieces"` and `legacyId`. Canonical booleans normalize source null to the source-column default only through an explicit migration rule and record that normalization.
- `artworkMedia` stores primary, supporting, and progress media. Identity is `(legacyTable, legacyId)` because source media IDs overlap across tables. Each source record preserves full and small URL/dimension fields; primary identity is `("Pieces", pieceId)`.
- Canonical imports update an imported field only when no audited owner mutation has changed it since the previous import. Conflicts are reported and never overwritten automatically.
- `legacyPendingTransactions` remain raw history with an optional resolved-artwork link for display. The legacy `(piece_db_id, full_name)` match is heuristic and never creates a canonical order.
- `orders` contains one canonical legacy order per distinct raw `stripe_id` string and one per new payment intent. A legacy identifier is not assumed to have a `pi_` prefix. Canonical legacy rows link all contributing raw source IDs.
- Legacy transaction `price` is stored as `legacyRecordedPrice` in integer dollars and explicitly excludes the separately charged $25 international shipping amount. Historical `amountPaid` remains unknown rather than being fabricated.
- No source `createdAt` exists. Migration records `importedAt` and preserves the verified source `date` at its actual day precision; it does not fabricate history.
- Source hashes cover canonicalized source fields only and exclude import bookkeeping. Objects use recursively sorted keys, verified dates remain `YYYY-MM-DD`, source JSON numbers retain their exported value, and the serializer version is recorded on every migration run. An unchanged source hash produces no write.

### Slugs and redirects

- Artwork slugs are computed only on first import and are immutable. Slug algorithm `v1` applies Unicode NFKD, strips combining marks, lowercases, converts `&` to `and`, collapses non-ASCII alphanumerics to one hyphen, trims hyphens, falls back to `untitled`, and appends `-<legacyId>`.
- Old `/details/[id]` links resolve by `legacyId` and redirect permanently to `/work/<slug>`.
- Duplicate titles never compete for the same slug.

### Availability and pricing

- Raw `active`, `available`, `sold`, and `price` values are preserved exactly, including nullable source semantics. The July 17 source snapshot contains zero nulls for all four artwork boolean flags.
- Derived `purchasable` is true only when canonical `active === true && available === true && sold !== true && price > 0`.
- Sold plus available records remain visible as sold archive works but are never purchasable.
- Active works with non-positive prices display an inquiry path without a price offer and never enter Stripe checkout.
- Owner reconciliation can change operational fields later through normal audited mutations; migration does not silently repair them.

### Ordering

- Preserve `o_id`, `p_id`, sentinels, and duplicates as legacy fields.
- Seed new unique `galleryOrder` and `homepageOrder` only when the canonical field is absent, deterministically from descending legacy order then ascending legacy ID. Identical imports never rewrite order; delta-added rows append deterministically without reshuffling existing work.
- Use gap-based integer positions for normal reordering and rebalance transactionally when gaps are exhausted.
- Media order is deterministic by role and ascending source ID on import.

### Images

- Existing UploadThing URLs remain source URLs during migration.
- The original upload is retained unmodified as the preservation source.
- Metadata and responsive display derivatives are generated server-side from the original once. Client-side canvas recompression is removed from the new flow.
- Hero eligibility excludes images whose intrinsic dimensions cannot cover the target without material upscaling; those works remain available elsewhere.
- Artwork elements use no saturation, contrast, opacity, blur, or color-grading filters.

### Authentication and privacy

- Clerk remains identity. Convex receives Clerk identity through its supported JWT integration and private functions call one owner-authorization helper.
- Owner authorization is not inferred from client state or route visibility.
- Public query shapes are allowlists. PII tables are private and excluded from public Convex functions, logs, reports, and analytics.
- Any Convex development deployment containing imported buyer PII is treated as production-sensitive: membership is recorded, access is minimized, reports contain aggregates only, and superseded PII-bearing deployments are deleted after verified replacement.

### Provider roles

- Convex is operational data and first-party business outcomes.
- Stripe is payment authority.
- UploadThing is original/media storage initially.
- Resend is transactional and simple campaign delivery.
- PostHog remains behavioral analytics. Dashboard aggregates are cached and labeled; widgets are omitted rather than populated with synthetic data if the API is unavailable or unsuitable.
- React Email produces versioned rendered output for simple campaign and transactional templates.

## Verification Matrix

- Data: counts, source IDs, source-field hashes, null/empty distributions, state combinations, relationships, ordering, assets, identical rerun, and newer-snapshot rerun.
- Auth: anonymous, signed-in non-owner, and owner behavior for Next routes, Convex functions, UploadThing, and tools.
- Commerce: stale price, sold/unavailable/non-positive-price artwork, concurrent checkout, successful payment, canceled session, replayed webhook, legacy-shaped unknown-intent webhook quarantine, failed email, and duplicate legacy sources.
- Images: JPEG/PNG/WebP/HEIC where provider support allows, portrait/landscape, large files, EXIF orientation, color profile, dimensions, derivative retry, and no double compression.
- Public UI: desktop 1600x1100, tablet portrait/landscape, mobile 390x844, keyboard, reduced motion, filters/search/sort, carousel, room view, forms, checkout, redirects, and metadata.
- Owner UI: dashboard, catalog, editor, orders, inbox, mailing, analytics, and tools; loading, empty, error, permission-denied, optimistic, and persistence states.
- Quality: clean install, typecheck, lint, Vitest, production build, audit, bundle comparison, Lighthouse, screenshot plus DOM/layout review, console, and failed-network review.

## Decisions

| Date       | Decision                                                                                                            | Rejected alternative                                                           | Reason                                                                                                                         | Reversal cost                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| 2026-07-17 | Use one branch with phase commits and one continuously updated draft PR.                                            | Separate PR per stack change.                                                  | The directive requires one reviewable overhaul while phase commits preserve bisectability.                                     | Low.                                                                                              |
| 2026-07-17 | Treat Neon as strictly read-only and preserve it after Convex cutover.                                              | Dual writes or destructive cleanup.                                            | Neon is the independent backup and rollback source.                                                                            | None.                                                                                             |
| 2026-07-17 | Keep existing UploadThing binaries initially and migrate URL records, not image bytes.                              | Re-host all artwork during the database migration.                             | It keeps database parity attributable and avoids a second irreversible migration.                                              | Medium. A later verified copy can update storage keys.                                            |
| 2026-07-17 | Preserve all five Neon tables in immutable raw tables and derive separate canonical operational records.            | Use canonical artwork/media records as the parity source.                      | Owner edits and delta imports would otherwise destroy the ability to prove source parity.                                      | Low. Canonical records can evolve independently.                                                  |
| 2026-07-17 | Use deterministic ID-suffixed immutable slugs.                                                                      | Conditional suffixes or title-only slugs.                                      | Source titles collide and may change.                                                                                          | Low. Redirect rules can be changed later.                                                         |
| 2026-07-17 | Derive purchasability conservatively without changing raw flags.                                                    | Treat `available` alone as sellable or auto-fix contradictory rows.            | Prevents accidental resale of sold work and preserves owner data.                                                              | Low. Owner mutations can reconcile records later.                                                 |
| 2026-07-17 | Split Convex read and write/commerce cutovers.                                                                      | One combined backend cutover.                                                  | Reads can be proven and rolled back independently before any new writes exist only in Convex.                                  | Low.                                                                                              |
| 2026-07-17 | Use a thin read adapter and parity scripts.                                                                         | Build a broad dual-backend repository around legacy UI.                        | Most legacy UI is replaced; the larger abstraction would be temporary and harder to verify.                                    | Medium.                                                                                           |
| 2026-07-17 | Use Vitest for domain, migration, authorization, and webhook tests.                                                 | No runner or a large browser-only suite.                                       | The repository currently has no runner, and deterministic business logic needs fast isolated coverage.                         | Low.                                                                                              |
| 2026-07-17 | Use Zustand only if a real cross-route UI need remains.                                                             | Mirror catalog or Convex records in a client store.                            | URL and server state already own those concerns.                                                                               | Low.                                                                                              |
| 2026-07-17 | Scope Mailing to consent, suppression, draft/preview/send, and outcomes.                                            | Build segmentation, scheduling, automation, and a full email service provider. | The expanded system is high-risk scope and duplicates provider capabilities.                                                   | Low. Deferred features can extend the schema.                                                     |
| 2026-07-17 | Keep artwork source-faithful and use separate scrims.                                                               | Apply filters or lower opacity on image elements.                              | Artwork fidelity is a core product requirement.                                                                                | None.                                                                                             |
| 2026-07-17 | Do not deploy production or change DNS without explicit approval.                                                   | Automatic production cutover at completion.                                    | This is an explicit halt condition.                                                                                            | None.                                                                                             |
| 2026-07-17 | Use one free Convex development deployment for local and Vercel preview QA; do not create paid preview deployments. | Create one Convex deployment per Vercel preview.                               | No paid infrastructure is authorized. The shared deployment is handled as production-sensitive while it contains imported PII. | Medium. Preview isolation can be added after plan approval.                                       |
| 2026-07-17 | Post-cutover rollback targets a restored PostgreSQL copy after approved provisioning, not original Neon.            | Temporarily lift the Neon read-only invariant during an incident.              | Original Neon remains an untouched backup and reconciliation source.                                                           | High. A rollback requires explicit approval, provisioning, and a controlled Convex export/import. |

## Migration Record

Pre-migration source protection and inventory:

- Full custom-format dump: `/Users/tsmith/dev/_codex/jws-fine-art-backups/2026-07-17/neon-production-pre-convex.dump`
- Dump SHA-256: `1c42170b66ca617bb275b60930e0ad943dca553bf92def6b52c4ecae8e7c6d9c`
- Schema snapshot: `/Users/tsmith/dev/_codex/jws-fine-art-backups/2026-07-17/neon-production-schema.sql`
- Schema SHA-256: `c632c9331b49f6b1269eaf2adc91242d3237d17e2285f59515dc40108e211d5f`
- Source server: PostgreSQL 16.14. Dump tool: PostgreSQL 18.4.
- Backup directory permissions: `0700`; backup file permissions: `0600`.
- The dump catalog parses successfully and includes all five tables, sequences, data sections, primary keys, and two media foreign keys.
- Restore command for an empty, disposable database: `pg_restore --clean --if-exists --no-owner --no-acl --dbname "$RESTORE_DATABASE_URL" /Users/tsmith/dev/_codex/jws-fine-art-backups/2026-07-17/neon-production-pre-convex.dump`.
- Source counts: 86 artworks, 150 supporting images, 5 progress images, 115 pending transactions, and 12 verified transactions.
- Source anomalies to preserve: 14 unresolved pending-artwork references; 3 verified rows sharing one Stripe payment intent; 15 sold plus available artworks; 9 non-positive prices; duplicate legacy order values; 3 normalized-title duplicate groups.
- Asset baseline: 481 unique operational artwork URLs returned `200`; nine sampled primary files matched stored dimensions exactly. Verified transaction snapshots add three distinct HTTP URLs not used by current artwork records: two return `200` and one returns `404`. No non-HTTP values exist in the July 17 snapshot.

This section will additionally record:

- Convex project/deployment identifiers without secret values.
- Export and import run IDs, source hashes, and migration script versions.
- Raw and canonical table counts and the explicit explanation for canonical deduplication.
- Field, relationship, null/empty, ordering, state, and asset parity results.
- Identical-rerun and newer-snapshot/delta-rerun results.
- Disposable restore evidence.
- Preview read/write cutover and rollback evidence.
- The unexecuted production freeze, final-delta, webhook-transition, and asymmetric-rollback procedure.

Development migration evidence:

- Convex team/project: `torreysmith165-gmail-com:jws-fine-art`; deployment selector `dev/torreysmith165`; deployment name `laudable-flamingo-85`. This is a free development deployment and is treated as production-sensitive while it contains imported buyer data.
- Baseline snapshot ID `2026-07-18T07-18-25-740Z-07486214abd6`; source summary hash `07486214abd62f610645da8d04b67ba10468482ca6245b64bf49a8fadad33d4b`.
- Synthetic snapshot ID `synthetic-2026-07-18T07-22-10-448Z-4a6088866481`; source summary hash `4a60888664812ac76f5dca49817e070ad5e138b9c7c4d720808191a2f414dd8b`.
- Raw snapshot history is append-only. Both snapshots remain present with exact counts for all five source tables. Canonical derivation always selects one snapshot explicitly.
- Operational baseline parity: 86 artworks, 241 media records, 10 deduplicated legacy orders, 14 preserved pending-artwork orphans, and zero migration conflicts.
- An identical baseline rerun produced zero canonical inserts or updates. The synthetic delta retained one absent artwork and media record as non-operational tombstones; restoring the baseline preserved those tombstones without affecting operational parity.
- Asset audit: 483 of 484 unique URLs returned HTTP 200. The only 404 is a transaction-only legacy S3 snapshot referenced by three verified rows; it remains raw history and is not operational artwork media.
- Disposable PostgreSQL restore matched all five source counts exactly. PostgreSQL 18 `pg_restore` emitted one non-data compatibility warning for the PostgreSQL 16 test server's unsupported `transaction_timeout` setting.
- Detailed aggregate evidence: `_overhaul/reports/PHASE_3_MIGRATION_VERIFICATION.md`, `_overhaul/reports/phase3-source-summary.json`, and `_overhaul/reports/phase3-asset-audit.json`.

## Production Cutover Runbook (Documented, Not Authorized)

1. Obtain one explicit approval covering the production freeze mechanism, production environment changes, Stripe transition, Convex production linkage, and Vercel production deployment. None is executed piecemeal.
2. At T0, deploy a server-enforced checkout maintenance gate and confirm the owner stops all admin edits. Verify the freeze with read-only Neon row counts and source hashes.
3. Expire every open Stripe Checkout Session through a rehearsed Stripe API script, or wait at least the full 24-hour default lifetime. Inspect and drain or account for every undelivered live webhook event before exporting data.
4. Create a fresh full Neon dump and schema snapshot with restrictive permissions and checksums. This T0 backup, not the July 17 planning backup, is the rollback anchor.
5. Export all five Neon tables and reconcile source identity sets in both directions. New rows are imported; rows absent from the final snapshot are marked `absentFromFinalSnapshot` and excluded from operational queries, never silently deleted or relaunched.
6. Run the final delta import before any webhook or write transition. Re-prove raw counts, source-ID sets, field hashes, canonical derivation, relationships, and asset reconciliation against the clean production-target Convex deployment.
7. Transition the existing live webhook URL and its live-only signing secret with the application write cutover. The new handler dedupes against canonical orders and imported raw Stripe IDs, stores Stripe event IDs, quarantines an unknown legacy-shaped payment for reconciliation, and acknowledges it with `200` without trusting metadata to create an order.
8. Verify paid state, sold state, email outcome, owner order visibility, public availability, and replay idempotency before re-enabling checkout.

## Post-Cutover Rollback Runbook (Documented, Not Authorized)

1. Freeze Convex checkout and owner writes, retain the Convex deployment read-only, and export all post-cutover orders, events, sold-state changes, inquiries, subscriber consent/suppression records, campaigns, media, and content edits with a PII-safe manifest.
2. Obtain approval for any replacement PostgreSQL provisioning. Restore the T0 Neon dump to that isolated database; original Neon remains untouched and read-only.
3. Apply the reviewed Convex reconciliation export to the restored copy, including sold/availability state and insertion of post-cutover payment identifiers into legacy dedupe records before checkout is allowed.
4. Repoint the legacy application and webhook only after count/hash checks, order reconciliation, and double-sale checks pass. Non-commerce records remain in the frozen Convex deployment plus the export manifest because the legacy schema has no destination for them.
5. Production deployment, webhook changes, and checkout re-enable again require explicit approval. A blind code rollback is prohibited after Convex has accepted writes.

## Release Hardening Follow-up (2026-07-18)

Status: **engineering gates pass; production cutover remains blocked pending provider and operational approval**

Completed safeguards:

- Convex imports now require an explicit target selector and exact non-development confirmation. Every non-development import creates an external file-storage-inclusive Convex export plus SHA-256 manifest before writing.
- Release audits fail on migration conflicts, open checkout intents, unresolved webhook quarantine, campaigns still sending, or failed campaign recipients. A development audit currently reports zero blockers.
- A server-enforced `JWS_WRITE_FREEZE` supports independent `owner`, `checkout`, and `public` scopes while leaving reads, unsubscribe, and Stripe webhook drain available.
- Upload persistence re-inspects provider-hosted JPEG, PNG, and WebP originals server-side with MIME, format, byte, pixel, redirect, timeout, and EXIF-orientation checks. Client-provided image dimensions are not trusted.
- Stripe checkout success now verifies the Checkout Session, Convex intent, artwork, and recorded order. Refund and dispute events are idempotently recorded, surface owner attention, and never automatically relist artwork.
- Campaign mail includes signed one-click unsubscribe links and standard list-unsubscribe headers. Invalid links do not mutate subscriber state.
- Node.js `24.x` is pinned in `.nvmrc` and `package.json`. Node 24.18.0 typecheck, lint, 28 tests, and the Next 16 production build pass.
- Public npm production and full dependency audits report no known vulnerabilities.
- The development Convex snapshot verifies at 86 operational artworks, 241 media records, 10 deduplicated legacy orders, 14 preserved pending-artwork orphans, and zero migration conflicts.
- Read-only UploadThing reconciliation found all 481 Convex-referenced provider objects. Fifty-two unreferenced provider objects are recorded in an external restricted report for owner review; none were deleted.

Remaining production gates:

- Development and the `feat/full-site-overhaul` Preview branch now have Stripe test-key overrides. Preserve Production's live keys in a production-only record, then remove the legacy generic Preview live-key target so unrelated previews cannot inherit live credentials.
- Reauthenticate Stripe CLI, create a test-mode webhook endpoint for the branch Preview, and replace its inherited live webhook signing secret with the test endpoint secret.
- Complete authenticated owner QA for artwork creation/editing/media, archive/restore/reorder, orders, inquiries, campaign draft, unsubscribe, and tools using test-scoped providers.
- Complete Stripe test-mode checkout, cancellation, payment failure, duplicate webhook replay, partial/full refund, and dispute fixtures. Configure the production webhook with the additional refund/dispute subscriptions during the approved transition.
- Freeze writes on the current live application, create a final Neon T0 dump/snapshot, and prove there is no delta from the production rehearsal import (or import the verified delta) before traffic switches.
- Review the 52 UploadThing orphans against legacy/raw records and retention requirements before any separately approved deletion.
- Obtain explicit approval for the write freeze, final delta, provider transition, production deployment, DNS/domain cutover, controlled purchase, and write re-enable.

Latest non-destructive evidence:

- Convex development export: `/Users/tsmith/dev/_codex/jws-fine-art-convex-backups/2026-07-18T23-43-17-692Z-development.zip`; SHA-256 `8c20752ea0dfa2507599ab958b0a3175dc19807890d7c1639bfc39a8c5281bda`.
- UploadThing report: `/Users/tsmith/dev/_codex/jws-fine-art-release-reports/uploadthing-development-1784418623475.json` (mode `0600`).
- Production-build Home desktop artifact: `cutover-home-desktop-node24`, `sha256:bfffa172fc4d70f0a4775f2fb4c6e5b94fef1c037e3e6479b9e206bb1a41a515`.
- Production-build Home mobile artifact: `cutover-home-mobile-node24`, `sha256:a0571833574033622916fd276c562da576c43afbd9b249ceb742bf423a4b2e96`.
- Browser smoke covered Home, Work, dynamic artwork, invalid unsubscribe, invalid checkout-success verification, and anonymous admin redirect at 1440x1000 and 390x844. No broken artwork images or horizontal overflow were found. The final Node 24 production-build reload produced zero console errors, zero HTTP 4xx/5xx responses, and no local PostHog or Vercel Speed Insights traffic.

Production Convex rehearsal evidence (2026-07-19):

- Deployment: `hushed-crane-268`; schema/functions deployed with `owner`, `checkout`, and `public` writes frozen.
- Fresh read-only Neon snapshot: `/Users/tsmith/dev/_codex/jws-fine-art-migration/production-rehearsal-20260719T161302Z/neon-snapshot`; snapshot ID `2026-07-19T16-13-03-178Z-07486214abd6`; source hash `07486214abd62f610645da8d04b67ba10468482ca6245b64bf49a8fadad33d4b`.
- Pre-import Convex rollback archive and SHA-256 manifest are stored beside the snapshot with restrictive permissions.
- Exact production parity passed: 86 artworks, 241 media records, 10 deduplicated historical orders, 14 preserved pending-artwork orphans, and zero migration conflicts.
- Production release audit passed with zero open checkout intents, webhook quarantines, sending campaigns, and failed recipients.
- Production UploadThing audit found 481 referenced objects, zero missing objects, and 52 unreferenced objects. No objects were deleted.
- Vercel project Node.js is `24.x`; production Convex URLs, read-backend selector, site URL, unique server secret, and unsubscribe secret are staged without redeploying the live application.

## Deferred

- WebGL/3D gallery. The product uses an accessible 2D room visualization first.
- Full email-service-provider features: complex segmentation, automation, recurring scheduling, visual drag-and-drop email builder, and deliverability infrastructure.
- Fabricated artwork narratives. Missing stories remain owner-authored work.
- Production Convex linkage, production data cutover, production Vercel deployment, DNS changes, and destructive Neon operations.
- Re-hosting all legacy image binaries unless reliability, quality, or provider constraints later justify a separate migration.

## Assumptions

- The checked-out baseline at `be3b821` represents current production code.
- `d2 v1` is the canonical visual and interaction direction; the inner site frame, not wireframe review chrome, is the target.
- Missing mobile and non-Home design captures are implementation references to be derived from the authored `d2 v1` source and its responsive behavior, then verified in preview. They are not blockers to non-destructive implementation.
- Existing free service projects should be reused where available. No paid infrastructure is authorized.
- `/events` redirects to Studio & Story and `/faq` redirects to Contact & Collector Guide unless real retained content proves a better target during route implementation.
- Commissions launches with only real available artwork/process material. If source content is insufficient, the route uses an honest inquiry-oriented process page without invented case studies.

## Evidence

- Source inventory: `_overhaul/INVENTORY.md`
- Baseline: `_overhaul/BASELINE.md`
- Pre-critique draft: `_overhaul/DRAFT_PLAN.md`
- First critique reports:
    - `_context/omp-overhaul-architecture-plan.md`
    - `_context/omp-overhaul-migration-plan.md`
    - `_context/omp-overhaul-security-commerce-plan.md`
    - `_context/omp-overhaul-product-ux-plan.md`
- Migration-only second critique reports:
    - `_context/omp-overhaul-migration-r2-correctness.md`
    - `_context/omp-overhaul-migration-r2-cutover.md`
- Approved design artifact: `jws-d2-v1-home-desktop`, `sha256:8cc5eb14f95c408ce785ac8372083586050a1612856a7387ad363689617a2f14`

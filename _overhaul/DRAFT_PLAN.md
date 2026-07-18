# JWS Fine Art Overhaul Draft Plan

This is the pre-critique implementation draft. `_overhaul/PLAN.md` becomes the final plan of record after Fable architecture and migration reviews are reconciled with local evidence.

## Safety Invariants

1. Neon remains read-only. No application, migration script, or manual query may write to it.
2. The pre-migration dump remains outside the repository with restrictive permissions and recorded checksums.
3. Every imported row retains its source table and numeric ID. Source anomalies are recorded, not silently normalized away.
4. Convex cutovers are controlled independently for reads and writes. UI redesign does not begin until data parity is proven.
5. Stripe, Clerk, Resend, UploadThing, PostHog, and Vercel secrets remain server-only and are never copied into reports or client bundles.
6. Production deployment and DNS changes require explicit user approval. Preview deployment is the QA target.

## Target Architecture

### Convex operational data

- `artworks`: canonical artwork state, legacy ID, slug, ordering, status flags, physical facts, price, story, archival metadata, created/updated import metadata.
- `artworkMedia`: primary/supporting/progress roles, legacy table/ID, source URL, storage key, dimensions, mime type, ordering, derivative metadata, processing state.
- `checkoutIntents`: server-created Stripe checkout session state, artwork snapshot, contact/shipping data, expiration, and reconciliation status.
- `orders`: one canonical row per Stripe payment intent for new events, immutable purchase snapshot, buyer and shipping data, payment/fulfillment state, and legacy transaction identity.
- `orderEvents`: append-only payment, email, and fulfillment history.
- `inquiries`: collector intent, selected artwork, message, contact state, assignee, and timeline.
- `subscribers`: consent, status, source, tags, and suppression state.
- `campaigns` and `campaignVersions`: editable email JSON, rendered HTML/text, audience rules, schedule, and immutable send version.
- `campaignRecipients`: delivery status, provider IDs, bounce, complaint, and unsubscribe outcomes.
- `siteContent` and `siteSettings`: small owner-editable content and homepage selections, with validated keys rather than an unbounded CMS.
- `migrationRuns`: source checksum, run ID, table counts, anomalies, and completion gate.

Convex queries and mutations are grouped by domain. Public queries return explicitly shaped documents and never expose private/order/admin fields. Owner mutations share one authorization helper that verifies Clerk identity and admin membership from validated JWT claims or a server-only check.

### Client and server state

- URL state owns public catalog query, status, facets, sort, and selected artwork navigation.
- Convex owns server data and live mutation state.
- React local state owns ephemeral component behavior.
- Zustand is limited to durable cross-route UI state that has no better owner, initially the collector shortlist and dismissible session UI. It will not mirror Convex records or URL filters.

### Provider boundaries

- Stripe checkout creation reads the current artwork and price server-side, creates an expiring intent, and stores only opaque IDs in redirect URLs.
- Stripe webhook processing is idempotent and transactionally marks the order and artwork state. Email failure does not roll back payment reconciliation.
- UploadThing receives originals only through an authenticated owner path. The server validates type/size, extracts metadata, and generates display derivatives without repeated lossy client transforms.
- PostHog remains event analytics. Server-only cached aggregate queries power the owner dashboard; Convex stores business outcomes and attribution fields needed to operate the studio.
- React Email source is versioned with output; Resend sends immutable campaign/order versions.

## Execution Sequence

### 1. Migration foundation while Neon serves production

- Add Convex and establish a development deployment without changing production Vercel reads.
- Define schema, indexes, auth helpers, domain query contracts, and migration-only internal mutations.
- Export Neon to deterministic JSON with hashes and no report-time PII.
- Import in dependency order: artworks, media, pending checkout history, verified purchase history.
- Preserve legacy IDs and unresolved pending references.
- Compare source and Convex counts, IDs, representative field hashes, null/empty distributions, media relationships, state combinations, and asset URLs.
- Re-run the same import to prove idempotency.

Rollback boundary: delete/recreate only the new development Convex deployment or migration-run documents. Neon and the live application are unchanged.

### 2. Read cutover with unchanged UI

- Introduce a repository boundary with matching Neon and Convex implementations.
- Add contract tests against deterministic fixtures and parity tests against both backends.
- Switch preview/local reads to Convex through environment configuration; do not dual-read per request.
- Exercise every public and owner read surface in a production build.

Rollback boundary: flip the read backend to Neon and rebuild the preview.

### 3. Owner writes and commerce cutover

- Implement Convex owner mutations for artwork, media metadata/order, visibility/order, tools, inquiries, subscribers, and campaigns.
- Move Stripe checkout intent and webhook reconciliation to Convex-backed domain functions.
- Preserve legacy order rows separately from canonical new-event idempotency.
- Verify create/edit/archive/restore/upload/reorder, inquiry, subscription, draft, schedule, checkout, replayed webhook, and failure recovery paths.
- Disable Neon write code only after preview verification.

Rollback boundary: before production approval, no production writes have been redirected. The branch can return to Neon unchanged.

### 4. Tailwind CSS v4 and state modernization

- Upgrade Tailwind/PostCSS and encode the Lit Wall tokens in CSS-first theme variables.
- Replace legacy one-off gradients and font packages with deliberate display/body typography.
- Add Zustand only for the shortlist/session state defined above.
- Keep this phase visually equivalent enough to isolate migration defects from redesign defects.

### 5. Public `d2 v1` implementation

- Build the shared shell and fixed header outside page scroll regions.
- Implement Home with source-faithful featured artwork, restrained carousel controls, reduced-motion behavior, available work, story, commissions, and mailing CTA.
- Implement Work with working URL-backed availability, search, facets, and sort; meaningful empty states; and optimized responsive media.
- Implement Artwork with selected-record routing, one clear carousel control set, image-only thumbnails, accurate facts/price/status, scale visualization, related work, inquiry, and checkout handoff.
- Implement Studio & Story, Commissions, Contact & Collector Guide, Checkout, confirmation/cancel, and compatibility redirects.
- Implement metadata, artwork JSON-LD, canonical URLs, Open Graph assets, dynamic sitemap, robots policy, and not-found behavior.

### 6. Owner console implementation

- Build invariant owner rail/top bar and responsive navigation.
- Dashboard: real needs-attention items, catalog/order/inquiry/subscriber summaries, and cached PostHog signals.
- Catalog: searchable/filterable artwork, homepage/ordering controls, archive/restore, bulk-safe actions.
- Artwork Editor: typed facts/story/SEO, robust original upload, derivative status, media roles/order, preview, autosave/status feedback, and publish checks.
- Orders: payment snapshot, fulfillment state/history, customer communication, and export.
- Inbox: artwork-aware inquiries and contact timeline.
- Mailing & Campaigns: consent-aware audience, drafts, React Email preview, versions, schedule model, and provider-result status.
- Analytics: PostHog aggregates plus first-party inquiry/order funnel outcomes, clearly labeled and cached.
- Tools: backup/export, test email, asset audit, and bounded maintenance jobs with confirmation and progress.

### 7. Optimization and cleanup

- Remove Neon/Drizzle/Postgres code and dev tooling from application paths after the reversible cutover window.
- Remove verified dead packages/files and stale compatibility components.
- Upgrade provider SDKs where supported by tests; do not chase unrelated majors.
- Split public/admin/client bundles, minimize providers at the root, cache public queries, and tune image sizes/priority/quality from measured routes.
- Add security headers, rate limits/abuse controls, strict input validation, webhook replay tests, and PII-safe logging.
- Complete keyboard, focus, reduced-motion, screen-reader, contrast, mobile, and error-state QA.

## Verification Matrix

- Data: count, ID, relationship, field-hash, null/empty, state-combination, asset, and second-run idempotency parity.
- Auth: anonymous, signed-in non-owner, and owner paths for routes, Convex functions, UploadThing, and tools.
- Commerce: stale price, unavailable artwork, concurrent checkout, successful payment, replayed webhook, failed email, canceled session, and duplicate source history.
- Images: JPEG/PNG/WebP/HEIC where supported, large portrait/landscape, color profile, source dimensions, thumbnail generation, failure/retry, and no double compression.
- Public UI: desktop 1600x1100, tablet portrait/landscape, mobile 390x844, keyboard, reduced motion, filters/search/sort, carousel, scale view, forms, checkout.
- Owner UI: same form factors where relevant, every visible control, optimistic/error/loading states, persistence after reload, and permission denial.
- Quality gates: clean install, typecheck, lint with zero warnings, tests, production build, audit, bundle comparison, Lighthouse, screenshots, DOM/layout metrics, console, and failed-network review.

## Decisions Requiring Explicit Approval Later

- Production Convex deployment linkage and production data import execution.
- Production Vercel deployment or environment cutover.
- Domain or DNS changes.
- Destructive cleanup of any Neon data or old binary assets.
- Paid plan changes or new paid infrastructure.

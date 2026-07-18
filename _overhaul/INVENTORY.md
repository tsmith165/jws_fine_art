# JWS Fine Art Overhaul Inventory

Inventory date: July 17, 2026. This document records the source application and production data without changing Neon.

## Application Baseline

- Framework: Next.js 16.2.10 App Router, React 19.2.7, TypeScript 5.6.3.
- Hosting: Vercel project `jwsfineart` in the existing team account.
- Authentication: Clerk, with owner access determined from membership in the `ADMIN` organization.
- Data: Neon PostgreSQL 16.14 through `@neondatabase/serverless` and Drizzle.
- Commerce: Stripe-hosted Checkout and a signed `payment_intent.succeeded` webhook.
- Images: UploadThing (`utfs.io`) with Next Image delivery.
- Email: Resend with React Email rendering for purchase receipts.
- Analytics: PostHog browser and server SDKs plus Vercel Speed Insights.
- Styling: Tailwind CSS 3.4.14, PostCSS, legacy global CSS, Cinzel, Lato, and several older UI packages.
- Client state: Zustand 5.0.14 is installed but is not the current source of application state.

## Route Inventory

| Current route | Role | Target `d2 v1` surface | Disposition |
| --- | --- | --- | --- |
| `/` | Public | Home | Rebuild in place with live featured artwork and carousel state. |
| `/gallery` | Public catalog | Work | Canonicalize to `/work`; keep a redirect for old links. |
| `/details` | Public helper | Artwork | Redirect to the selected or first available artwork. |
| `/details/[id]` | Public artwork | Artwork | Canonicalize to `/work/[slug]`; preserve numeric-ID redirects. |
| `/biography` | Public | Studio & Story | Canonicalize to `/studio`; keep a redirect. |
| `/contact` | Public | Contact & Collector Guide | Rebuild with a persisted inquiry flow. |
| `/events` | Public | Studio/content extension | Fold into studio/news content; keep route compatibility until content review. |
| `/faq` | Public | Collector guide extension | Fold into contact/collector guide; keep route compatibility. |
| `/slideshow` | Public | Home/Work discovery | Remove from primary navigation after behavior is absorbed; retain redirect. |
| `/checkout/[id]` | Commerce | Checkout | Rebuild around a server-validated Convex artwork record. |
| `/checkout/success/[id]` | Commerce | Confirmation | Preserve, with order lookup independent of untrusted URL metadata. |
| `/checkout/cancel/[id]` | Commerce | Checkout cancellation | Preserve with recovery back to the artwork. |
| `/profile` | Authentication utility | Owner/account | Keep only if Clerk account management still needs it. |
| `/signin`, `/signup` | Authentication | Owner sign-in | Preserve; hide sign-up if public registration is not required. |
| `/qr` | Utility | Marketing utility | Preserve as an owner tool unless real inbound links require it publicly. |
| `/admin/manage` | Owner | Catalog | Replace with searchable catalog, visibility, ordering, and archive controls. |
| `/admin/edit`, `/admin/edit/new`, `/admin/edit/images/[id]` | Owner | Artwork Editor | Consolidate into typed create/edit/media workflows. |
| `/admin/orders` | Owner | Orders | Rebuild with order status and fulfillment history. |
| `/admin/tools` | Owner | Tools | Keep bounded maintenance and verification jobs. |
| not currently present | Owner | Owner Dashboard | Add needs-attention and business overview. |
| not currently present | Owner | Inbox | Add first-party collector inquiries. |
| not currently present | Owner | Mailing & Campaigns | Add subscriber consent, segments, drafts, previews, and scheduling model. |
| not currently present | Owner | Analytics | Add cached PostHog aggregates and first-party business outcomes. |

API routes currently cover Stripe webhooks, UploadThing, and a PostHog distinct ID. The rebuild keeps provider callbacks as server-only routes, removes the custom distinct-ID round trip, and adds authenticated boundaries for Convex HTTP actions only where the provider cannot call a Convex action directly.

## Neon Schema And Data

Neon remains read-only. The pre-migration backup and restore details are in `_overhaul/PLAN.md`.

| Source table | Rows | ID range | Relationships |
| --- | ---: | --- | --- |
| `Pieces` | 86 | 3-97 | Parent record. |
| `ExtraImages` | 150 | 1-153 | Required FK to `Pieces.id`; zero orphans. |
| `ProgressImages` | 5 | 1-6 | Required FK to `Pieces.id`; zero orphans. |
| `PendingTransactions` | 115 | 1-115 | No database FK; 14 historical rows reference artwork no longer present. |
| `VerifiedTransactions` | 12 | 1-12 | No database FK; zero missing artwork references. |

The source schema has primary-key indexes only. It contains no `created_at`, `updated_at`, upload timestamp, checkout timestamp, or soft-delete timestamp columns. Migration timestamps must therefore identify the import, not claim to be original creation history.

### Artwork State

- 69 active, 57 available, 41 sold, and 53 framed records.
- 15 records are both sold and available. This is existing source state and may represent archive visibility; migration must not reinterpret it silently.
- 72 records have no description, 8 have no piece type, and all 86 have physical dimensions.
- 9 records have non-positive prices; three are unsold and unavailable.
- Every artwork has a stored small image.
- Artwork has 1-8 media records including the primary image, averaging 2.80.
- `o_id` and `p_id` are legacy ordering values. They are not unique and include `-1000000` archive sentinels.
- Duplicate groups exist for `o_id` (5), `p_id` (3), and normalized titles (3). Stable identity must use the source primary key, not any of those fields.

### Transaction Anomalies

- Pending checkout IDs 8-22 include 14 references to artwork records no longer present. Preserve the original numeric reference and an unresolved relationship rather than dropping the rows.
- Three verified rows (IDs 2-4) share one Stripe payment-intent ID and otherwise agree on artwork, price, and date. Preserve all source rows in the raw import, mark the repeated event during reconciliation, and enforce idempotency for future webhooks.
- Buyer fields contain private customer data. Migration reports may include counts and hashes only, never names, addresses, email addresses, phone numbers, or payment identifiers.

## Asset Inventory

- 481 unique operational HTTP asset URLs are referenced across primary, supporting, progress, and derived small images; all 481 returned HTTP `200` during the July 17 audit.
- Verified transaction snapshots reference three additional distinct HTTP URLs not used by current artwork records. Two returned `200` and one returned `404` during the migration review.
- Across operational and transaction snapshot media there are 484 unique HTTP URLs and zero non-HTTP values. Current references use `utfs.io`; historical transaction snapshots also include legacy S3 hosts.
- Stored primary dimensions range from 461-1920px wide and 573-1920px high.
- No primary or derived image has invalid stored dimensions.
- Nine primary images sampled across the ID range exactly matched their stored source width and height.
- The current client upload path resizes the original to a 2560px bounding box and generates a 900px derivative in browser canvas at JPEG/WebP quality 0.96. The maintenance path generates 450px JPEG derivatives with Sharp quality 90 and 4:4:4 chroma subsampling.
- The rebuild will preserve original files, capture metadata server-side, avoid artwork filters, and create derivatives from the original exactly once.

## Data And Provider Boundaries

- Convex will become the operational source of truth for artwork, media metadata, ordering, orders, inquiries, mailing consent, campaigns, and owner workflow state.
- UploadThing remains the binary asset store initially. Convex stores immutable file identity, URLs, dimensions, media role, order, and processing status.
- Stripe remains the payment authority. Convex records checkout intent and reconciled order state; client-provided price and artwork metadata are never authoritative.
- PostHog remains the behavioral analytics system of record. The application stores only small cached aggregates and first-party business outcomes, not a duplicate raw event stream.
- Resend remains the delivery provider. Editable campaign source, rendered HTML/plain text, audience rules, and outcomes live in Convex.
- Clerk remains authentication. Owner authorization must be enforced in every Convex mutation/action, not only route middleware.

## Dependency Findings

- Production audit: zero known vulnerabilities across 522 production dependencies.
- Full audit: one moderate, development-only esbuild advisory through Drizzle Kit. Drizzle is removed after cutover instead of forcing an incompatible transitive override.
- GitHub Dependabot reports the same esbuild advisory.
- Knip identified probable dead files/packages and one undeclared `dotenv` import in `drizzle.config.ts`. These findings are advisory until each import path is verified.
- Next.js, React, and Zustand are already on current supported generations. Tailwind is the intended major upgrade.
- Major provider SDK upgrades (Clerk and PostHog) will be done only with their current APIs verified and after tests cover auth and analytics boundaries.

## `d2 v1` Design Contract

The approved direction is The Lit Wall: charcoal viewing-room surfaces, warm ivory type, restrained brass accents, source-faithful artwork, short motion, and an artwork-first hierarchy.

Required public surfaces are Home, Work, Artwork, Studio & Story, Commissions, Contact & Collector Guide, and Checkout. Required owner surfaces are Dashboard, Catalog, Artwork Editor, Orders, Inbox, Mailing & Campaigns, Analytics, and Tools.

The production implementation keeps the wireframe's structure and taste but does not copy prototype-only behavior. All controls must operate on real shared data, all artwork navigation must resolve the selected record, and proposed owner features must be implemented or labeled accurately rather than presented as fake production data.

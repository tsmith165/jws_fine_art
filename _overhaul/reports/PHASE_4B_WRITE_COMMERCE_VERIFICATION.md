# Phase 4b Convex Write and Commerce Verification

Date: 2026-07-17

## Scope

This phase moves branch-only owner writes, public inquiry/subscriber writes, upload metadata, checkout intents, and canonical Stripe order processing to Convex. Neon remains unchanged and is still available through the read adapter. The old Neon schema and migration code remain in the repository until Phase 8, but no active application code outside the explicit read adapters calls a Neon insert, update, or delete operation.

## Implemented boundaries

- Clerk remains the identity provider. Owner Next actions obtain a Clerk `convex` JWT and every owner Convex query or mutation calls `requireOwnerIdentity`, which requires `owner_role=ADMIN` from the verified token.
- UploadThing request middleware calls the same central Next owner authorization policy before issuing an upload token.
- Public inquiry, subscription, checkout, and webhook calls use `CONVEX_SERVER_WRITE_SECRET` from server-only code. No `NEXT_PUBLIC_` variable contains the secret.
- Migration derivation and audit functions are internal Convex functions.
- Original uploads are preserved. The browser no longer resizes or recompresses images before upload; Sharp reads normalized server-side dimensions from the uploaded original.
- Checkout price, availability, title, shipping, buyer, and artwork identity are snapshotted from canonical Convex state before Stripe Checkout is created.
- Stripe success handling requires a matching canonical checkout intent, exact amount and currency, a unique payment intent, and a previously unseen event ID.
- Successful payment creates one canonical order, appends an order event, closes the intent, and atomically marks the artwork sold and unavailable.
- Unknown or mismatched verified Stripe events are quarantined. Replayed events are deduplicated. Unrelated Stripe event types are recorded as ignored without creating quarantine noise.
- Confirmation email failure is appended to the canonical order and does not roll back a recorded payment.
- Owner campaign sends prepare a consent-filtered recipient set, use Resend's batch API in bounded groups of 100, persist every provider message ID or failure, and finalize the campaign from recorded recipient outcomes.
- Legacy verified transaction rows remain separate from new Stripe orders.

## Automated behavior evidence

`pnpm test` passes 15 tests covering:

- deterministic migration primitives and owner-field conflict protection;
- owner authorization rejection and ADMIN acceptance;
- artwork create/edit/reorder/archive/restore and audit events;
- primary image replacement, supporting image add/reorder/title/dimension/archive;
- unavailable and non-positive-price checkout rejection;
- concurrent checkout locking and canonical amount/shipping snapshots;
- successful payment, one-order enforcement, sold-state update, same-event replay, and second-event replay;
- canceled checkout intent recovery;
- unknown and amount-mismatched payment quarantine;
- unrelated Stripe event ignore behavior;
- inquiry persistence;
- consent, unsubscribe, and resubscribe events;
- campaign draft/sending/sent state;
- site-content writes;
- fulfillment and failed-notification events.

The tests use `convex-test`, an in-memory Convex runtime. They do not mutate the development deployment or Neon.

## Data and build evidence

- `pnpm migration:verify-reads`: public parity verified with 69 artworks, 142 supporting images, 2 progress images, and the same navigation samples.
- `pnpm migration:verify-owner-reads`: owner parity verified with 86 artworks, 150 supporting images, 5 progress images, and 12 legacy transactions.
- `JWS_READ_BACKEND=convex pnpm build`: production build passed for all application routes.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed with four pre-existing legacy warnings. These are removed with the replaced UI in Phase 6/8.
- `pnpm audit --prod --registry=https://registry.npmjs.org`: no known production dependency vulnerabilities.
- `rg -n "db\\.(insert|update|delete)" src --glob '!src/db/**' --glob '!src/drizzle/**'`: no matches.
- Convex development deployment accepted the schema and functions through `pnpm exec convex dev --once`.

## Vercel preview evidence

The branch was deployed with branch-scoped Preview variables only. Production environment variables and the production deployment were not changed.

- Deployment: `dpl_3j8LMi8oa5T9H4oEdpAQZUMUj1Wd`
- Branch preview: `https://jwsfineart-git-feat-full-site-overhaul-tsmith-hobby.vercel.app`
- The public gallery hydrated all 69 Convex-backed public artworks.
- Selecting Dawn resolved the correct Convex detail record, including title, medium, `8\" x 6\" Framed` dimensions, `$220` price, and the 1920-by-1535 original image.
- `/checkout/96` resolved the same canonical Dawn title and `$220` price without creating a Checkout Session.
- Anonymous access to `/admin/manage` was rejected and redirected to the public site.
- Clerk's sign-in surface rendered on the deployed origin. A qualifying owner session could not be bound to this branch preview, so deployed owner JWT propagation remains part of final preview QA.
- The deployed pages had no horizontal overflow or failed visible artwork images. The only browser-console warnings were Clerk development-key and deprecated redirect-property notices.
- The visual capture is staged as `phase4b-convex-gallery-desktop` and linked to the approved `jws-d2-v1-home-desktop` design artifact.

The configured Stripe secret is not a test-mode key. No Checkout Session, payment, webhook, email, upload, or owner mutation was created merely to satisfy this phase gate. Those provider side effects require test credentials and a bindable owner preview session, and remain mandatory in the final production-candidate preview matrix. The 15-test `convex-test` matrix is the current deterministic evidence for those domain and provider-boundary behaviors.

This closes the branch-level Convex application cutover gate. No production Convex deployment exists and no production write cutover has occurred.

## Production cutover checklist (not executed)

1. Obtain explicit production-deployment approval.
2. Disable new checkout starts and owner mutations on the legacy production site. Keep public reads available.
3. Let all open Stripe Checkout Sessions expire. New sessions currently expire after 30 minutes; also inspect Stripe for older sessions and allow the documented webhook retry backlog to drain.
4. Confirm there are no unprocessed successful payments, email failures, or open payment-event quarantines.
5. Create a fresh full Neon dump and schema snapshot with restrictive permissions and recorded checksums. Neon remains read-only.
6. Export a fresh deterministic Neon snapshot, import it into the production Convex deployment, and repeat raw/canonical parity, relationship, null, status, and asset checks.
7. Export the current Convex development state needed for review only. Do not promote development PII or test records directly to production.
8. Reconcile the final delta in both directions: every Neon source row must be represented in Convex, and every owner-created or payment-created Convex record since the baseline must be explicitly accounted for.
9. Configure production Clerk JWT issuer, server write secret, UploadThing, Stripe test/live separation, Resend, PostHog, and `JWS_READ_BACKEND=convex` in the approved production environment.
10. Register the new production Stripe webhook endpoint while checkout remains disabled. Deliver signed test events and verify replay behavior.
11. Run the full production-build and browser matrix against a production-candidate preview.
12. Record owner sign-off on catalog counts, sold state, orders, image quality, and owner workflows.
13. Enable production traffic only after explicit approval. Re-enable checkout last and watch the first real order end to end.

## Post-cutover rollback (not executed)

Rollback after Convex receives production writes is asymmetric. The original Neon database is never silently written to.

1. Disable checkout and owner mutations immediately while leaving public reads on the last known-good backend.
2. Export all Convex-only records: owner-origin artworks/media, owner revisions, inquiries, subscribers and consent events, campaigns, site content, canonical orders, order events, Stripe event IDs, checkout intents, and quarantines.
3. Reconcile every successful Stripe payment against canonical orders and preserve the payment-intent/event dedupe set before changing stacks.
4. Restore the latest Neon dump into a new isolated PostgreSQL database. Never use the original Neon backup source as the rollback write target.
5. Apply a reviewed translation of the Convex-only delta to the restored copy. Preserve identifiers or an explicit mapping and verify sold/available state, orders, buyer data, media, and owner edits.
6. Re-run full parity and application tests against that restored copy.
7. Move Stripe webhook delivery only after the restored stack can deduplicate every already-seen event and payment intent.
8. Resume checkout only after owner sign-off. Retain the Convex export and original Neon backup unchanged for audit and recovery.

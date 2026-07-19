# Production Cutover Runbook

This runbook is intentionally fail-closed. Production deployment, DNS changes, provider secret changes, webhook changes, and write enablement require explicit approval. Neon remains read-only and intact.

## Before Approval

1. Put test-only Stripe, Clerk, UploadThing, Resend, and Convex credentials in the branch preview. Never share live Stripe secrets with preview or development scopes.
2. Add a dedicated `UNSUBSCRIBE_SIGNING_SECRET` of at least 32 random bytes to each environment.
3. Deploy Convex functions to the intended preview deployment and run:

```bash
pnpm release:check-env
pnpm migration:verify -- --snapshot=/absolute/path/to/latest-snapshot
pnpm release:audit-convex
pnpm release:audit-uploadthing
pnpm release:audit-stripe
```

4. Complete authenticated owner QA for create, edit, archive, restore, reorder, original image upload, supporting image upload, orders, inquiries, campaign draft, unsubscribe, and tools.
5. Complete Stripe test-mode checkout, webhook replay, failed payment, cancellation, partial refund, full refund, and dispute fixtures. Verify exactly one Convex order per payment intent.
6. Verify public desktop/mobile routes, checkout status states, owner authorization boundaries, console/network health, Lighthouse, and accessibility.

## Approved Freeze And Final Import

1. Set `JWS_WRITE_FREEZE=owner,checkout,public` in both the live application and production Convex deployment. Confirm reads still work and new checkouts, public writes, and owner mutations are blocked. Stripe webhooks must remain enabled so existing sessions can drain.
2. Run the Stripe audit until open Checkout sessions, pending webhook deliveries, Convex open checkout intents, and webhook quarantine are zero.
3. Create a fresh Neon dump and deterministic snapshot outside the repository. Record restrictive permissions and checksums.
4. Provision a clean production Convex deployment. Deploy the schema/functions before importing.
5. Import only with an exact target confirmation. The command automatically exports a checksummed pre-import rollback archive:

```bash
pnpm migration:import -- --snapshot=/absolute/path/to/latest-snapshot --prod --confirm-target=production
pnpm migration:verify -- --snapshot=/absolute/path/to/latest-snapshot --prod
pnpm release:audit-convex -- --prod
pnpm release:audit-uploadthing -- --prod
```

For a named deployment, replace `--prod` with `--deployment=<name>` and pass `--confirm-target=deployment:<name>` to write-capable commands.

## Provider Transition

1. Verify production uses live Stripe credentials and every non-production scope uses test credentials.
2. Point the live Stripe webhook at the new handler, set its new live signing secret, and subscribe to payment intent success/failure/cancellation, `charge.refunded`, and dispute created/updated/closed events.
3. Verify the production Clerk JWT template and ADMIN owner claim against Convex.
4. Verify UploadThing and Resend production tokens, the public site origin, unsubscribe signing, and one-click unsubscribe.
5. Deploy production. Keep all writes frozen while public reads and owner authentication are checked.
6. With explicit approval, remove `owner,checkout,public` from `JWS_WRITE_FREEZE`. Perform one controlled purchase and one controlled owner mutation, then re-run all release audits.

## Rollback

Before writes are enabled, roll back the production application and Convex target independently. After Convex accepts any production write, a blind code rollback is prohibited.

1. Freeze `owner,checkout,public` writes and keep Stripe webhook drain active.
2. Export Convex with file storage and retain the generated checksum manifest outside the repository:

```bash
pnpm release:convex-export -- --prod --confirm-target=production
```

3. Reconcile every Convex-only order, payment intent, sold/availability change, inquiry, subscriber event, campaign, media record, and owner edit into an isolated PostgreSQL restoration. Never write back to the original Neon source.
4. Re-enable checkout only after Stripe dedupe identifiers and sold state are proven in the selected rollback system and explicit approval is given.

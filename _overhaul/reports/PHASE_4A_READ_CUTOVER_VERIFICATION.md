# Phase 4a Read Cutover Verification

## Scope

Phase 4a adds a thin server-only read adapter. The legacy Neon implementation remains the fail-safe default. Convex reads are enabled only when `JWS_READ_BACKEND` is exactly `convex`; unset and unrecognized values resolve to Neon.

Public reads use `ConvexHttpClient` without adding a browser WebSocket provider. Owner reads preserve the existing Next.js Clerk organization check and add a Convex authorization boundary requiring a Clerk-signed JWT whose `owner_role` claim is `ADMIN`.

## Contract Parity

`pnpm migration:verify-reads` passed with:

-   69 active artworks
-   142 active supporting images
-   2 active progress images
-   Identical six-piece homepage order
-   Identical first available artwork
-   Identical sampled previous/next navigation

`pnpm migration:verify-owner-reads` passed with:

-   86 owner-visible artworks
-   150 supporting images
-   5 progress images
-   12 raw legacy verified transactions

The existing site-content copy is represented by source constants rather than a Neon table, so it has no database backend contract to compare in this phase.

## Authorization Setup

The Convex development deployment uses Clerk JWT authentication with audience `convex`. The idempotent setup script synchronizes the current owner role into Clerk public metadata for qualifying organization members and creates or updates the `convex` JWT template. Private owner queries call one shared Convex authorization helper and do not trust client state.

An interactive owner-token smoke test is deferred to authenticated preview QA because no qualifying owner account had an active Clerk session during this phase. Static authorization boundaries, deployment configuration, type checking, and owner query parity all passed.

## Build and Rollback Proof

Three production builds passed sequentially from the same working tree:

1. `JWS_READ_BACKEND` unset (Neon reads)
2. `JWS_READ_BACKEND=convex` (Convex reads)
3. `JWS_READ_BACKEND` unset again (rollback proof)

All 19 routes compiled in each build. Type checking, lint (zero errors and four unchanged legacy warnings), four migration tests, and both read-parity scripts passed.

## Exact Preview Rollback

1. Remove `JWS_READ_BACKEND` from the preview environment, or set it to any value other than the exact lowercase string `convex`.
2. Redeploy the same commit.
3. Run `pnpm migration:verify-reads` and `pnpm migration:verify-owner-reads` with the variable unset.
4. Smoke-test Home, Biography, owner Catalog, and owner Orders.

No data copy, reverse migration, Neon write, or code revert is required because Phase 4a changes reads only.

# JWS Fine Art Overhaul Ledger

This ledger is the plan of record for the production-site overhaul. It is updated at every phase boundary and whenever a material decision changes.

## Current State

- Branch: `feat/full-site-overhaul`
- Baseline commit: `be3b821`
- Target design: `d2 v1` (The Lit Wall) from `/Users/tsmith/dev/_codex/jwsfineart-wireframes`
- Production data policy: Neon remains read-only and intact as the rollback source.
- Current phase: 1 of 8, inventory and baseline measurement.

## Phases

### Phase 1: Inventory and Baseline

Status: **in progress**

Acceptance criteria:

- [ ] Record every application route and its public, commerce, authentication, or owner-console role.
- [ ] Record package versions, known vulnerabilities, unused dependencies, and justified upgrade targets.
- [ ] Record the complete Neon schema, relationships, row counts, nullability, and UI-dependent fields without modifying Neon.
- [ ] Record where every image and document asset lives, how URLs are formed, and representative resolution checks.
- [ ] Record the complete `d2 v1` design surface and map each real route to its target screen or an explicit extension.
- [ ] Capture baseline typecheck, lint, tests, production build, bundle output, browser behavior, accessibility, and performance measurements.

### Phase 2: Plan of Record and Critique

Status: **pending**

Acceptance criteria:

- [ ] Write the implementation sequence, rollback boundaries, measurable optimization targets, and verification matrix.
- [ ] Complete an independent architecture/data/security/UX critique and revise the plan for verified failure modes.
- [ ] Complete a second migration-only review covering identity, timestamps, relationships, assets, idempotency, and rollback.
- [ ] Commit and push the reviewed plan before application implementation begins.

### Phase 3: Convex Schema and Migration

Status: **pending**

Acceptance criteria:

- [ ] Create a typed Convex schema that preserves stable Neon identity and required timestamps.
- [ ] Create a full Neon export before migration and document a tested restore command.
- [ ] Create idempotent, re-runnable migration tooling with no Neon writes or schema operations.
- [ ] Prove per-table row-count parity, relationship integrity, null/empty invariants, representative field parity, and asset URL resolution.
- [ ] Keep production application reads on Neon throughout this phase.

### Phase 4: Convex Read and Write Cutover

Status: **pending**

Acceptance criteria:

- [ ] Cut read paths to Convex behind a reversible configuration boundary while preserving existing behavior.
- [ ] Exercise all public, commerce, and owner-console read surfaces against a production build.
- [ ] Cut write paths and admin mutations to Convex with authentication and authorization verified.
- [ ] Prove new writes, edits, ordering, uploads, inquiries, mailing data, and order state survive reload and maintain expected relationships.
- [ ] Retain a documented, tested path back to Neon reads until final handoff.

### Phase 5: Client State and Tailwind CSS v4

Status: **pending**

Acceptance criteria:

- [ ] Audit existing Zustand usage and keep it only for cross-route or durable client state that React/URL/server state does not already own.
- [ ] Upgrade to Tailwind CSS v4 with explicit theme tokens and no visual or behavioral regressions before the redesign begins.
- [ ] Remove obsolete Tailwind/PostCSS configuration and validate the production CSS bundle.
- [ ] Pass typecheck, lint, production build, and browser regression QA at desktop and mobile breakpoints.

### Phase 6: `d2 v1` Product Implementation

Status: **pending**

Acceptance criteria:

- [ ] Implement the Lit Wall public home, work, artwork, studio/story, commissions, contact/collector guide, and checkout experiences with real data.
- [ ] Implement the Lit Wall owner dashboard, catalog, artwork editor, orders, inbox, mailing/campaigns, analytics, and tools experiences with real mutations where applicable.
- [ ] Make all search, availability, faceting, sorting, image navigation, room visualization, forms, upload, and admin workflows functional.
- [ ] Match the reviewed `d2 v1` hierarchy, typography, surfaces, and artwork-first presentation across desktop and mobile without color grading artwork.
- [ ] Verify every route and meaningful UI state against a production build with screenshots and DOM/layout evidence.

### Phase 7: Optimization, Security, and Discoverability

Status: **pending**

Acceptance criteria:

- [ ] Resolve actionable package and application security findings without hiding remaining risk.
- [ ] Define and meet measured performance targets for key public routes, including image payloads and Core Web Vitals proxies.
- [ ] Verify image fidelity, source dimensions, responsive variants, caching, lazy loading, and no accidental recompression artifacts.
- [ ] Implement metadata, structured data, canonical URLs, sitemap/robots behavior, social cards, and artwork-level discoverability.
- [ ] Verify keyboard navigation, focus visibility, semantic landmarks, contrast, labels, reduced motion, and common screen-reader paths.

### Phase 8: Cleanup and Final Verification

Status: **pending**

Acceptance criteria:

- [ ] Remove Neon client code from application paths, dead dependencies, obsolete migrations, orphaned styles, unused components, and superseded implementations while preserving the Neon backup/export.
- [ ] Pass clean install, typecheck, lint, tests, production build, package audit, and full browser QA.
- [ ] Record before/after performance and bundle evidence, complete all ledger checkboxes, and state known limitations plainly.
- [ ] Push the completed branch and update the single PR with the final branch-level description. Do not merge or deploy production.

## Decisions

| Date | Decision | Rejected alternative | Reason | Reversal cost |
| --- | --- | --- | --- | --- |
| 2026-07-17 | Use one branch with phase-level commits and one continuously updated PR. | A separate branch or PR per stack change. | The directive requires one reviewable overhaul while phase commits preserve bisectability. | Low. Individual commits can be reverted or split later. |
| 2026-07-17 | Treat Neon as strictly read-only and preserve it after Convex cutover. | Dual writes or destructive cleanup. | The existing production database is the rollback source and backup. | None. This is the safest default. |
| 2026-07-17 | Keep the current Zustand dependency provisionally and audit its actual role before adding state. | Introduce a new store architecture immediately. | Zustand 5 is already installed; the requested change may already exist and must earn its complexity. | Low. |
| 2026-07-17 | Do not deploy production or change DNS without explicit approval. | Automatic production cutover at completion. | Production deployment is an explicit halt condition. Preview deployments remain allowed for QA. | None. |

## Migration Record

Not started. This section will contain:

- Neon dump path, checksum, creation command, and restore procedure.
- Source schema and per-table counts.
- Convex deployment/environment identifiers without secret values.
- Import run IDs, stable-ID strategy, field mappings, and any normalization.
- Count, field, relationship, null/empty, and asset parity results.
- Rollback and re-run procedures.

## Deferred

- WebGL/3D gallery. The reviewed wireframes intentionally use an artwork-first 2D room visualization. A 3D gallery remains a separate product decision because of asset-production, accessibility, and runtime cost.
- Any destructive Neon operation or production DNS/deployment change.

## Assumptions

- The checked-out `main` branch at `be3b821` is the current production-code baseline.
- The canonical redesign source is the `d2 v1` revision in the adjacent `jwsfineart-wireframes` repository.
- Existing service accounts and projects should be reused when available; no paid infrastructure will be provisioned without approval.
- Image binaries will remain at their existing provider initially unless inventory proves that moving them is necessary for reliability, quality, or cost.


# Phase 3 Migration Verification

Verified on July 18, 2026 against the free Convex development deployment. This report intentionally contains aggregates and non-secret identifiers only.

## Deployment

- Convex team and project: `torreysmith165-gmail-com:jws-fine-art`
- Deployment selector: `dev/torreysmith165`
- Deployment name: `laudable-flamingo-85`
- Environment: development only; no production Convex project or paid preview deployment was created.
- Access classification: production-sensitive while imported buyer records exist. Raw migration, order, inquiry, subscriber, and conflict tables have no public Convex query. Reports remain aggregate-only.

## Source Snapshot

- Snapshot ID: `2026-07-18T07-18-25-740Z-07486214abd6`
- Serializer: `jws-neon-canonical-json-v1`
- Source summary hash: `07486214abd62f610645da8d04b67ba10468482ca6245b64bf49a8fadad33d4b`
- Raw rows: 86 pieces, 150 extra images, 5 progress images, 115 pending transactions, and 12 verified transactions.
- Canonical operational records: 86 artworks, 241 artwork media records, and 10 legacy orders (one per distinct legacy Stripe value).
- Preserved anomalies: 14 pending transactions reference absent artwork; 15 artworks are both sold and available; 9 artworks have non-positive prices. Migration code does not silently repair these source states.

## Determinism And Preservation

- Raw legacy rows are append-only by snapshot ID. The importer refuses a partially imported snapshot and skips a snapshot table only when its stored count exactly matches the manifest.
- Both the baseline and synthetic delta snapshots remain present simultaneously with exact per-table counts of 86, 150, 5, 115, and 12.
- Canonical derivation reads one explicit snapshot ID and never mixes rows from separate snapshots.
- Reimporting the baseline produced zero artwork inserts, artwork updates, media inserts, media updates, or order inserts.
- Slugs retain their first-import identity. Initial ordering is seeded once; later source rows append without reordering owner-managed records.
- Owner-mutated fields are protected by the tested merge planner and generate migration conflicts instead of source overwrites.

## Delta Exercise

- Synthetic snapshot ID: `synthetic-2026-07-18T07-22-10-448Z-4a6088866481`
- Source summary hash: `4a60888664812ac76f5dca49817e070ad5e138b9c7c4d720808191a2f414dd8b`
- Exercise: changed piece 3, removed piece 97, and added piece 1000001 with one primary media record.
- Result: synthetic parity passed with 86 operational artworks, 241 operational media records, one retained absent artwork, one retained absent media record, 10 legacy orders, and no duplicates.
- Restoring the baseline snapshot passed parity with the synthetic-only records retained as non-operational tombstones. They are excluded from all operational counts.

## Asset Audit

- 484 unique HTTP asset URLs checked.
- 481 operational artwork URLs returned HTTP 200.
- Three transaction-only snapshot URLs were checked: two returned HTTP 200 and one legacy S3 URL returned HTTP 404.
- The unavailable transaction snapshot is preserved in immutable raw history and is not promoted to canonical artwork media.
- Full aggregate report: `_overhaul/reports/phase3-asset-audit.json`.

## Independent Backup Restore

- Restored the custom Neon dump into an isolated local PostgreSQL 16 cluster on port 55432.
- PostgreSQL 18 `pg_restore` reported one expected compatibility warning because PostgreSQL 16 does not recognize the newer `transaction_timeout` session setting. No table or data restore failed.
- Restored counts: 86 `Pieces`, 150 `ExtraImages`, 5 `ProgressImages`, 115 `PendingTransactions`, and 12 `VerifiedTransactions`.
- The local server was stopped after verification and the isolated restore cluster was removed from its working path. It contained no credentials and was outside the repository.

## Verification Commands

- `corepack pnpm typecheck`
- `corepack pnpm lint` (zero errors; four pre-existing application warnings)
- `corepack pnpm test`
- `corepack pnpm build`
- `NPM_CONFIG_REGISTRY=https://registry.npmjs.org corepack pnpm audit --prod` (no known vulnerabilities)
- `corepack pnpm migration:verify -- --snapshot=/Users/tsmith/dev/_codex/jws-fine-art-migration/2026-07-17-initial`
- `corepack pnpm migration:audit-assets -- --snapshot=/Users/tsmith/dev/_codex/jws-fine-art-migration/2026-07-17-initial`
- PostgreSQL restore and direct count queries documented above.

Neon remained read-only throughout this phase. Application reads and writes still target Neon; Convex currently contains migration and canonical foundation data only.

# Active Agent State

- Objective: hand the production JWS Fine Art overhaul to a fresh agent without repeating repository discovery.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Baseline commit: `b4b2108c677bebc2df745030d74b5573f2434c1a`
- Full handoff: `_context/PROJECT_HANDOFF.md`
- OMP/artifact ledger: `_context/LOOP_RULES_AND_CONTEXT.md`
- Production: `https://jwsfineart.com`
- Convex production: `https://hushed-crane-268.convex.cloud`
- Data safety: Convex is active; Neon remains read-only backup.
- Current gate: production Convex now includes the homepage-rotation schema/functions that were missing when Vercel deployed.
- Next action: signed-in production verification of `/admin/homepage`, including add/remove/reorder/save with the original rotation restored after testing.
- Do not relaunch completed OMP jobs or reimplement homepage rotation. Deploy Convex before Vercel whenever a Convex contract changes.

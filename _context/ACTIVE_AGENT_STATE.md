# Active Agent State

- Objective: continue JWS Fine Art from session `019f3504-d23b-7733-8e30-681f2c981fae` without repeating its 17 GB transcript.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Current source baseline: `b4b2108c677bebc2df745030d74b5573f2434c1a`
- Full handoff: `_context/PROJECT_HANDOFF.md`
- Session reconstruction: `_context/SESSION_CONTINUATION_019F3504.md`
- OMP/artifact ledger: `_context/LOOP_RULES_AND_CONTEXT.md`
- Production: `https://jwsfineart.com`
- Convex production: `https://hushed-crane-268.convex.cloud`
- Data safety: Convex is active; Neon remains a read-only backup.
- Completed gate: authenticated production verification of `/admin/homepage`.
  Remove, add, reorder, publish, restore, reload, responsive layout, console, and
  Vercel error-log checks passed. The exact original five-artwork rotation was
  restored and republished.
- Passing QA artifacts:
  `admin-homepage-production-fixed-desktop` and
  `admin-homepage-production-fixed-mobile`.
- Newly verified risk: production Clerk emits a development-key warning. The
  next auth task requires the intended Clerk production instance/keys plus
  coordinated Convex issuer and Vercel configuration. Never record key values.
- Remaining product decisions: final shipping/refund language and replacement
  copy, if desired, for `Personal work, grounded in a real story.`
- Do not relaunch completed OMP jobs or reimplement homepage rotation. Deploy
  Convex before Vercel whenever a Convex contract changes.

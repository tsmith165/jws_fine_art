# Active Agent State

## July 23 Select And Filter Polish

- Source commit `a5e0a6c` is pushed to `origin/feat/full-site-overhaul`.
- Vercel deployment `dpl_Ce8iUU7ecp48tym6HHfXppse5NhY` is ready and aliased
  to `https://www.jwsfineart.com`.
- All single-select controls in the public and owner shells now use a shared
  inset chevron with `48px` of reserved right padding.
- The Work filter popover now has clearer hierarchy, live match feedback, a
  descriptive framed-work control, active-filter status, and a reset action
  that preserves unrelated query parameters.
- Prettier, typecheck, lint, all 76 tests, and a Node 24 production build
  passed.
- Production browser QA passed at desktop and a real `390 × 844` mobile
  viewport. The mobile page had no horizontal overflow; the panel stayed
  within the viewport; filter apply/reset behavior passed; and authenticated
  owner selects had the same computed chevron and padding contract.
- QA evidence:
  `_context/select-and-filter-polish-production-qa.md`.
- Preview aliases:
  `work-filters-panel-production-desktop`,
  `work-filters-panel-production-mobile`, and
  `app-select-caret-spacing-production-mobile`.
- The temporary browser emulation was cleared and the browser session was
  finalized.

- Objective: continue the July 23 production polish after session
  `019f3504-d23b-7733-8e30-681f2c981fae`, including the landing regressions and
  the follow-up `/admin/homepage` artwork-library card layout.
- Workspace: `/Users/tsmith/dev/_codex/jws-fine-art`
- Branch: `feat/full-site-overhaul`
- Starting source commit: `4345f60`
- Completed source commit: `e7b727c`
- Full handoff: `_context/PROJECT_HANDOFF.md`
- Session reconstruction: `_context/SESSION_CONTINUATION_019F3504.md`
- Production: `https://jwsfineart.com`
- Convex production: `https://hushed-crane-268.convex.cloud`
- Data safety: Convex is active; Neon remains a read-only backup.

## Current Change

- Follow-up: moved each artwork-library Add action below the title and medium so
  both text rows use the complete content column. Both rows now truncate with
  ellipses and expose their full values through native hover tooltips.
- Fixed the collection-card black gutters by limiting the absolute label rule to
  `.lw-collection-card-label`; it had also matched the progressive-image wrapper
  and inset the artwork by `24px 24px 22px`.
- Restored first-slide reveal by withholding `is-revealed` until the progressive
  image reports ready. Added a nine-second subtle Ken Burns animation to revealed
  current and incoming hero images.
- Removed the five-artwork limit from the public query, server read, carousel,
  owner read/mutation, and `/admin/homepage`. The dot rail now scrolls for long
  rotations.
- Added a Convex test proving six artworks can be published and returned.

## Verification And Deployment

- Formatting, typecheck, lint, focused tests, and the full 76-test suite passed
  before continuation.
- Production Convex and the configured development Convex deployment were
  updated successfully on July 23, 2026.
- A production Next.js build passed under Node `v24.18.0`.
- Commits `7b5c6a9` and `cdf66c2` were pushed to
  `origin/feat/full-site-overhaul`.
- Vercel production deployment `dpl_Hqv9GXok1MFmhF4ViQJWqFtfSYs7` is ready and
  aliased to `https://www.jwsfineart.com`.
- Desktop `1440 × 1000` and mobile `390 × 844` browser QA passed. Collection
  wrapper gaps measured `0px` on every edge, the first hero transitioned from
  opacity `0` to `1`, its nine-second Ken Burns transform advanced over time,
  and neither breakpoint had horizontal page overflow.
- Authenticated `/admin/homepage` QA added a sixth artwork in unsaved client
  state, observed `6 selected` with Publish enabled, then reloaded without
  publishing. Production data was not changed.
- Detailed evidence: `_context/landing-regressions-production-qa.md`.
- Artifact aliases:
  `collection-card-borders-fixed-production-desktop`,
  `collection-card-borders-fixed-production-mobile`,
  `hero-motion-fixed-production-desktop`, and
  `hero-motion-fixed-production-mobile`.
- Artifact validation passed with 44 design artifacts, 62 preview QA artifacts,
  and 17 analysis records. The temporary browser viewport was reset and the
  browser session was finalized.
- Commit `e7b727c` passed formatting, typecheck, lint, and a Node 24 production
  build before push.
- Vercel deployment `dpl_Dv8vUA6Eox3Vis6njKApstfsAnGk` is ready and aliased to
  production.
- Authenticated production QA passed at `1440 × 1000` and `390 × 844`.
  Metadata and Add widths match, the action sits below both text rows, title and
  medium share the ellipsis contract and full-value tooltips, and neither
  breakpoint has page-level horizontal overflow.
- Follow-up evidence:
  `_context/admin-homepage-library-card-layout-qa.md`.
- Follow-up artifact aliases:
  `admin-homepage-library-add-row-before`,
  `admin-homepage-library-add-row-production-desktop`, and
  `admin-homepage-library-add-row-production-mobile`.
- QA analyses were saved into both follow-up previews. Artifact validation
  passed with 45 design artifacts, 64 preview QA artifacts, and 19 analysis
  records.
- The temporary viewport was reset and the authenticated browser session was
  finalized.
- Follow-up implementation, deployment, and production QA are complete.

## Known Separate Risk

- Production Clerk emits a development-key warning. Fixing that requires the
  intended Clerk production instance/keys plus coordinated Convex issuer and
  Vercel configuration. Never record key values.

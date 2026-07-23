# Admin Homepage Production QA

Date: 2026-07-23
URL: `https://www.jwsfineart.com/admin/homepage`

## Functional Verification

- Authorized owner route rendered successfully.
- Error digest `2794093951` was not present.
- Original rotation recorded before writes:
  1. Bluffs Over The Point
  2. Fresh Powder
  3. After Work Session
  4. Coronado Bridge
  5. Sunrise Over Jordanelle
- Removed `Sunrise Over Jordanelle`.
- Added `Sunset on Beryl`.
- Moved `Sunset on Beryl` earlier.
- Published successfully; UI reported `Homepage rotation published.`
- Removed the temporary item.
- Restored `Sunrise Over Jordanelle`.
- Republished successfully.
- Reloaded and confirmed the exact original rotation persisted.
- Reloaded the public homepage and confirmed its featured-artwork controls use
  the restored five-item sequence.
- Vercel production error-log query returned no errors.

## Visual Verification

Desktop:

- Viewport: 1440x1000
- No page-level horizontal overflow.
- Selected artwork count: 5 / 5.
- Artwork thumbnails, titles, media labels, reorder controls, and remove controls
  were visible and aligned.
- Artifact: `admin-homepage-production-fixed-desktop`

Mobile:

- Viewport: 390x844
- No page-level horizontal overflow.
- The owner navigation uses its intended horizontally scrollable icon rail.
- Heading, instructions, count, artwork rows, and controls remained readable and
  usable in the single-column layout.
- Artifact: `admin-homepage-production-fixed-mobile`

## Separate Finding

The console emitted a Clerk warning that development keys are in use in
production. This did not block the tested workflow, but it requires a deliberate
Clerk production-instance migration coordinated with the production Convex JWT
issuer and Vercel environment. No credential values were inspected or recorded.

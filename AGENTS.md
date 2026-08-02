# JWS Fine Art Project Guide

## Build and deployment workflow

Do not run `next build`, `npm run build`, or another local production build for
this project. Vercel is the production-build authority and the deployment is the
build gate.

- Run the relevant local fast checks, normally `npm run typecheck`, `npm run
lint`, and targeted or full `npm test`.
- Push the branch to a Vercel preview when a preview review is useful. Push to
  the production branch or run the established production deployment workflow
  when the user requests production deployment.
- Inspect the Vercel deployment result and logs. If it fails, fix the cause,
  commit and push the correction, and redeploy until the requested environment
  is healthy.
- Do not use a successful local build as a substitute for a Vercel deployment,
  and do not spend time making local production builds work.
- Convex schema or function changes must be deployed to the matching Convex
  environment before or alongside the Vercel deployment so server rendering
  does not target an outdated Convex API.

## Artwork image fidelity

Artwork is the product. Treat visible softness, grain introduced by delivery, incorrect color, and a placeholder that remains blurred as release-blocking defects.

- Public hero, catalog, collection, and detail images must render from the original `image_path` (or equivalent full source). `small_image_path` is only for a temporary blurred placeholder or an intentionally tiny owner-tool thumbnail.
- Use `CATALOG_ARTWORK_IMAGE_POLICY` for public catalog and collection cards. Do not lower its declared slot size or quality without desktop and mobile network plus screenshot evidence.
- Every `next/image` using `fill` must have a truthful `sizes` value. During QA, compare the requested `_next/image?...&w=` width with the rendered image width multiplied by device pixel ratio.
- CSS blur belongs only on the placeholder layer. The final artwork layer must not use blur, sharpening, saturation, contrast, or other fidelity-altering filters.
- Progressive loading must recover from an optimizer failure by retrying the original source. Never allow a blurred placeholder to become the terminal successful state.
- Do not hide a low-resolution source with CSS or client-side upscaling. Flag it for a higher-resolution studio upload. Public originals should normally be at least 1200 px on the long edge and 900 px on the short edge.

## Required image QA

Before shipping a change to artwork image selection, sizing, optimization, or animation:

1. Check representative landscape, portrait, and framed pieces on both `/` and `/work`, plus one matching detail page.
2. Verify desktop and mobile layouts, final-layer opacity, `currentSrc`, request width, rendered dimensions, device pixel ratio, and failed image requests.
3. Inspect saved screenshots at original detail with the project visual-QA workflow. Do not call an image sharp based only on DOM state.
4. Keep fidelity and transfer size in balance. Prefer a bounded shared size policy over `100vw` everywhere or `unoptimized` by default.

Document intentional exceptions beside the component and in `_context/`.

## Checkout and tax policy

The owner has explicitly chosen tax-inclusive pricing without Stripe Tax. Treat
this as a product and operations decision, not an open implementation choice.

- Keep `STRIPE_AUTOMATIC_TAX_ENABLED=false` in production and disabled by
  default everywhere else. Do not create Stripe Tax registrations or enable
  automatic tax unless the owner explicitly reverses this policy and the
  provider, accounting, and legal setup has been completed together.
- Checkout charges exactly the artwork price plus the selected delivery charge.
  Never add a separate tax line or increase the buyer's total for sales tax.
- Preserve the public statement "Sales tax is included in the listed price."
  The studio backs the California tax portion out of eligible paid orders and
  reports the set-aside in `/admin/business`.
- The dormant Stripe Tax code path is a fail-closed future option, not permission
  to activate the feature. A configured tax code alone is insufficient.
- Read `docs/PAYMENTS_AND_TAXES.md` before changing checkout, totals, receipts,
  order accounting, public tax copy, or provider configuration.
- When commerce or tax behavior changes, run the provider-safety and tax tests,
  verify the environment without printing secrets, and confirm a created Stripe
  Checkout Session does not enable `automatic_tax` under the current policy.

## Clerk and owner authentication

Clerk exists only to authenticate and authorize Jill's owner/admin workspace.
It is not part of public browsing, checkout, payment confirmation, tax, or
mailing subscription flows.

- Keep Clerk providers and browser scripts off public routes. Public pages must
  continue to work without an authenticated Clerk session.
- The current Clerk development-instance warning inside authenticated admin is
  an accepted, deferred owner-tool risk and is not a public-site or checkout
  release blocker.
- Do not authorize, create, or migrate a Clerk production instance merely to
  remove that warning. A production migration requires a new explicit owner
  decision.
- If a migration is approved later, handle Clerk keys, the Convex JWT template,
  `CLERK_JWT_ISSUER_DOMAIN`, ADMIN owner identities/claims, Vercel environment
  scopes, and end-to-end admin sign-in as one coordinated migration. Never
  switch only one of those boundaries.

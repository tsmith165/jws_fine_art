# Payments And Taxes

How JWS Fine Art collects payments and handles sales tax. This is an
operational reference for the studio and for agents working in this repo. It
is not tax or legal advice; Jill's accountant has the final word on rates,
filings, and deductions.

Last reviewed: July 24, 2026.

## Payment flow

- Checkout is Stripe Checkout in `payment` mode. `src/app/checkout/actions.ts`
  creates a `checkoutIntents` record in Convex, then a Stripe Checkout Session
  with the stable idempotency key `checkout-intent:<intentId>`.
- The artwork price and the fixed insured-shipping charge are separate line
  items. Oversize and international work is quoted by the studio and blocks
  self-serve payment.
- Stripe webhooks land in the durable `stripeWebhookInbox` and produce
  `orders` records with buyer, address, delivery method, amounts, refunds, and
  dispute state. Confirmation emails go through the retried
  `notificationOutbox`.
- `/admin/business` reports revenue and runs Stripe reconciliation
  (`commerceReconciliationRuns`), which snapshots Stripe fees and net amounts.

## Pricing and tax model

Decided July 24, 2026:

- Listed prices are tax-inclusive. The buyer always pays exactly the
  listed price plus shipping. Public copy states
  "Sales tax is included in the listed price." on the artwork page, checkout,
  the shipping guide, the collector guide, and the confirmation email. Posting
  this is what makes tax-included pricing valid with the CDTFA.
- Jill remits California sales tax herself out of the collected amount.
  Stripe Tax is fully implemented but disabled: `STRIPE_AUTOMATIC_TAX_ENABLED`
  is `false` in production and disabled is the default everywhere. Do not
  create Stripe Tax registrations while this model is in effect.
- Re-enabling Stripe Tax later requires: a CDTFA registration in Stripe,
  `STRIPE_AUTOMATIC_TAX_ENABLED=true`, and the reviewed
  `STRIPE_ARTWORK_TAX_CODE`. The checkout path is fail-closed behind the flag.

## Which sales are CA taxable

The studio is at 5130 La Jolla Blvd, San Diego, CA 92109 (City of San Diego).

| Order type                      | CA taxable? | Treatment                        |
| ------------------------------- | ----------- | -------------------------------- |
| Shipped to a California address | Yes         | Set aside tax at the studio rate |
| Local studio pickup             | Yes         | Set aside tax at the studio rate |
| Shipped to another U.S. state   | No          | Exempt interstate sale           |
| International (studio-quoted)   | No          | Exempt export                    |

"Not CA taxable" means California charges no sales tax on the sale, not that
another state does. Exempt sales are still reported on the CDTFA return as
gross sales and then deducted as interstate/foreign commerce, so every order
must record its destination classification. The buyer of an out-of-state
order technically owes use tax to their own state; that is the buyer's
obligation, not the studio's.

Out-of-state collection duty only arises if the studio establishes nexus in
another state: a physical presence, or economic nexus (commonly $100,000 in
sales or 200 transactions into one state per year). Current volume is nowhere
near this. Check the by-state sales breakdown once a year with the
accountant.

## Tax rate

- Combined rate at the studio address: 7.75% (7.25% statewide base +
  0.50% San Diego County district tax). Verified against the CDTFA city and
  county tables current as of July 1, 2026.
- Set-aside policy: apply 7.75% to every CA-taxable order (CA delivery or
  pickup). For deliveries inside San Diego County this is exact. For
  deliveries elsewhere in California the studio is below the $500,000
  statewide threshold that would require collecting other districts' taxes,
  so 7.75% is a slightly conservative simplification; the accountant settles
  exact district allocation at filing time.
- Because prices are tax-inclusive, the tax portion is backed out of the
  total: `tax = total − total ÷ 1.0775`. Example: a $500.00 CA sale contains
  $35.96 of tax and $464.04 of taxable receipts. Shipping charges for
  delivered goods are generally part of the same calculation when not
  separately exempt; confirm treatment with the accountant.
- Rates change on April 1 and July 1. Re-check the studio address each
  January and July at https://maps.cdtfa.ca.gov/ and update this doc and the
  configured rate together.

## What the database records

Stored today on `orders` (Convex): `amountPaidCents`, `shippingPaidCents`,
`refundedCents`, `taxPaidCents` (Stripe Tax only — null while Stripe Tax is
disabled), `taxIncluded`, `international`, `deliveryMethod`, and the full
`shippingAddress`. Reconciliation runs store Stripe `feeCents` and
`netCents`.

Planned tracking (approved direction, not yet implemented):

- `taxJurisdiction`: `'CA' | 'interstate' | 'international'`, derived from
  delivery method and shipping address state at payment time.
- `taxRateBps`: the rate applied (775 today), so historical orders stay
  correct when the rate changes.
- `taxSetAsideCents`: the backed-out tax portion for CA-taxable orders; 0 for
  exempt orders.
- A backfill migration classifying existing paid orders from their stored
  addresses.
- `/admin/business`: replace the dead "Tax recorded" (Stripe Tax) figure with
  "Tax to set aside", add a calendar-year view, and include per-order
  jurisdiction, rate, and set-aside columns in the CSV export so the CDTFA
  return and the annual nexus check are read-offs.

## Filing checklist for the studio

1. CDTFA return: report all gross sales; deduct interstate and foreign
   sales; remit the set-aside on CA-taxable sales.
2. Keep the tax-included copy on the site (it is the posting that permits
   tax-inclusive pricing).
3. January and July: re-verify the studio rate at the CDTFA address lookup.
4. Yearly with the accountant: review the by-state sales export for economic
   nexus, and confirm the shipping-charge treatment.

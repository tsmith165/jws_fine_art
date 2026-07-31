# Payments And Taxes

How JWS Fine Art collects payments and handles sales tax. This is an
operational reference for the studio and for agents working in this repo. It
is not tax or legal advice; Jill's accountant has the final word on rates,
filings, and deductions.

Last reviewed: July 31, 2026.

> **Current owner decision:** Stripe Tax must remain off. This document
> supersedes older readiness plans that recommended configuring Stripe Tax
> before launch. The existence of dormant automatic-tax code is not permission
> to enable it; doing so requires an explicit new owner decision and coordinated
> accounting, legal, and provider setup.

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

Tax set-aside tracking (implemented July 24, 2026):

- `taxJurisdiction`: `'CA' | 'interstate' | 'international'`, derived from
  delivery method and shipping address state at payment time. A parseable
  U.S. address outranks the legacy `international` flag (imported records
  carried it on real CA sales), and an address whose state cannot be
  determined is conservatively treated as CA.
- `taxRateBps`: the rate applied (775 today), so historical orders stay
  correct when the rate changes.
- `taxSetAsideCents`: the backed-out tax portion for CA-taxable orders; 0 for
  exempt orders.
- The policy lives in `shared/tax.ts` (`CA_SALES_TAX_RATE_BPS`,
  `orderTaxProfile`); new paid orders are stamped in
  `convex/commerce.ts` at payment time.
- `migrations:backfillOrderTaxSetAside` (dry-run flag supported) classifies
  existing orders from their stored addresses and is idempotent.
- `/admin/business` shows "Tax to set aside" with the CA-taxable order count,
  and the range picker includes "This year" for filing. The CSV export
  includes the set-aside summary, a sales-by-destination table for the annual
  nexus check, and per-order rows with jurisdiction, rate, and set-aside.

## Test orders

Orders carry an optional `isTest` flag. Flagged orders are hidden from the
`/admin/orders` list (a toggle shows them), excluded from Business reporting,
tax set-aside totals, fulfillment queues, and the CSV export. The owner can
mark or unmark any order from its detail panel;
`migrations:backfillTestOrders` marked the historical $1 owner test
purchases. Real sales must never be flagged — the flag removes them from tax
reporting.

## Filing checklist for the studio

1. CDTFA return: report all gross sales; deduct interstate and foreign
   sales; remit the set-aside on CA-taxable sales.
2. Keep the tax-included copy on the site (it is the posting that permits
   tax-inclusive pricing).
3. January and July: re-verify the studio rate at the CDTFA address lookup.
4. Yearly with the accountant: review the by-state sales export for economic
   nexus, and confirm the shipping-charge treatment.

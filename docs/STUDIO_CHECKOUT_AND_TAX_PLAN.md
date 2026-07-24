# JWS Fine Art: Checkout & Sales Tax Plan

**Prepared for Jill Weeks Smith Studio | July 2026**

---

## The Short Version

Collectors buy paintings on jwsfineart.com through a secure Stripe checkout. Every listed price **includes California sales tax** — the buyer always pays exactly the price on the page, plus a fixed insured-shipping charge. The website automatically works out, for every sale, whether California tax applies and how much of the collected money should be set aside for the tax return.

Three decisions drive everything in this document:

1. **Prices are tax-inclusive.** No tax line is added at checkout. The tax portion is backed out of the listed price after the sale, and the studio remits it to California.
2. **We are not using Stripe's automated tax product.** It would add a 0.5% fee to every taxed sale and requires a formal tax registration inside Stripe. At the studio's sales volume, our own tracking does the same job for free. The integration is built and can be switched on later if volume ever justifies it.
3. **Only California sales are taxed.** Sales shipped to other states and other countries are exempt from California sales tax, and the studio owes nothing to the destination state either — the legal reasons are explained below.

The dashboard at `/admin/business` shows the running "Tax to set aside" total, and a downloadable report gives your accountant every sale with its tax classification.

---

## How Checkout Works Today

**The buyer experience.** A collector opens an available painting, sees the price (with a note that sales tax is included), and clicks through to checkout. They choose how the artwork gets to them:

- **Insured U.S. shipping** — a fixed price based on the artwork's size and framing (Small $25/$45, Medium $50/$75, Large $100/$130, unframed/framed). The exact charge is shown before payment and added to the total.
- **Local studio pickup** — free; the studio coordinates a time with the collector after payment.
- **International delivery** — not self-serve. The site collects the inquiry and the studio quotes insured international delivery personally before any payment happens.

Payment itself happens on Stripe's hosted page. **Card details never touch the website.** Stripe collects the delivery address securely, the artwork is reserved for 30 minutes while checkout is open, and a painting can never be sold twice — the system refuses a second payment on a one-of-one work even if two people race for it.

**After payment.** The buyer gets a confirmation email, the order appears in the studio's admin Orders page with a simple packing workflow (needs attention → packed → shipped → delivered), and every Stripe event is recorded durably so nothing is lost if an email or webhook hiccups.

---

## Why Prices Are Tax-Inclusive

Galleries and artists commonly quote one clean price for a work. Adding 7.75% at the final step of checkout is a conversion killer and feels wrong for original art. Instead, the listed price is the full price, and the studio treats the tax portion as part of its own cost of the sale.

California explicitly permits this model as long as the buyer is told tax is included. That posting requirement is satisfied — "Sales tax is included in the listed price." appears on the artwork page, the checkout page, the checkout summary, the shipping guide, the collector guide, and the purchase confirmation email.

The practical consequence: **the tax comes out of the listed price, not on top of it.** For a $500 California sale at 7.75%, the taxable amount is $464.04 and the tax portion is $35.96 ($500 ÷ 1.0775 = $464.04). The website does this math automatically on every taxable sale.

---

## Stripe Tax: What It Is, and Why We're Not Using It

**What it is.** [Stripe Tax](https://stripe.com/tax) is Stripe's automated tax product. When enabled, Stripe calculates the exact sales tax for every transaction based on the buyer's precise address (down to the local district level), collects it during checkout, tracks the studio's exposure in every U.S. state, and produces filing-ready reports. Full documentation: [docs.stripe.com/tax](https://docs.stripe.com/tax) and setup guide: [docs.stripe.com/tax/set-up](https://docs.stripe.com/tax/set-up).

**What it costs and requires.** Per [Stripe's pricing](https://stripe.com/tax/pricing), Stripe Tax adds **0.5% of every transaction where tax is collected**, on top of Stripe's normal card processing fee (2.9% + 30¢). It also requires the studio to create a formal **tax registration** inside Stripe — a legal declaration of where the business is registered to collect, which must match an active CDTFA registration.

**Why we chose not to use it (for now):**

| Consideration       | Stripe Tax                                 | Our approach                                          |
| ------------------- | ------------------------------------------ | ----------------------------------------------------- |
| Cost per taxed sale | 0.5% extra (≈ $2.50 on a $500 work)        | $0                                                    |
| Setup               | Formal CDTFA-backed registration in Stripe | None — studio files with CDTFA directly               |
| Accuracy needed     | District-level precision across 50 states  | One studio rate; out-of-state sales are exempt anyway |
| Best suited for     | High volume, many states with nexus        | Exactly what it says — which is not this business     |

At the studio's volume — a handful of sales per year, taxable only in California — Stripe Tax would be paying for multi-state automation the business doesn't need. Our own tracking (described below) produces the same end result: an accurate number for the CDTFA return.

**The door stays open.** The Stripe Tax integration is fully built into the checkout code behind a switch that is currently off. If sales volume ever grows to the point where multi-state obligations appear, it can be turned on with a configuration change and a Stripe registration — no rebuild needed.

---

## The Studio's Tax Rate

The studio is at **5130 La Jolla Blvd, San Diego, CA 92109** (Pacific Beach, City of San Diego).

| Component                     | Rate      |
| ----------------------------- | --------- |
| California statewide base     | 7.25%     |
| San Diego County district tax | 0.50%     |
| **Combined rate applied**     | **7.75%** |

This was verified against the current CDTFA rate tables (effective July 1, 2026). You can confirm it yourself anytime with the state's official address lookup at [maps.cdtfa.ca.gov](https://maps.cdtfa.ca.gov/) or the [city and county rate tables](https://cdtfa.ca.gov/taxes-and-fees/rates.aspx).

**How the rate is applied.** Every California-taxable sale sets aside 7.75% of the collected total (backed out of the tax-inclusive price). For deliveries within San Diego County this is exact. For deliveries elsewhere in California — say Los Angeles, where the local rate is higher — the studio is far below the $500,000 statewide sales threshold that would require collecting other districts' add-on taxes, so the single studio rate is the correct simple policy. Your accountant settles the exact district allocation on the return.

**Rates change.** California adjusts district taxes on April 1 and July 1. The rate is checked against the CDTFA lookup each January and July, and the website's configured rate is updated in step.

---

## Which Sales Are Taxable

| Sale type                       | CA tax? | What happens                                           |
| ------------------------------- | ------- | ------------------------------------------------------ |
| Shipped to a California address | **Yes** | 7.75% of the total is set aside for the CDTFA return   |
| Local studio pickup             | **Yes** | Same — the sale happens in San Diego                   |
| Shipped to another U.S. state   | No      | Exempt interstate sale; recorded and reported, $0 owed |
| International (studio-quoted)   | No      | Exempt export; recorded and reported, $0 owed          |

**Why out-of-state sales owe nothing — to anyone.** Two separate questions get conflated here, so it's worth being precise:

- **California doesn't tax them.** A painting shipped to a buyer in Washington or New York is an interstate sale, which is exempt from California sales tax. It still appears on the CDTFA return as gross sales and is then deducted as interstate commerce — which is why the website records the destination of every order.
- **The buyer's state doesn't either — because the studio has no "nexus" there.** A state can only require an out-of-state seller to collect its tax if the seller has a connection to that state: a physical presence (store, employee, inventory), or **economic nexus** — commonly **$100,000 in sales or 200 separate transactions into that one state per year** (the thresholds established after the Supreme Court's 2018 _South Dakota v. Wayfair_ decision). Selling a few paintings a year into any given state is nowhere near either threshold. Technically the buyer owes "use tax" to their own state on the purchase, but that is the buyer's personal obligation — the studio has no collection or filing duty.
- **We watch this yearly.** The downloadable report includes a sales-by-destination-state table, so an annual glance (ideally with your accountant) confirms no state is approaching a threshold. At current volume this check takes thirty seconds.

---

## How Every Sale Is Tracked

The moment a payment succeeds, the website stamps the order with three permanent facts:

- **Tax jurisdiction** — `CA`, `interstate`, or `international`, determined from the delivery method and the shipping address Stripe collected. Pickup orders are always CA. If an address is ever unreadable, the sale is conservatively treated as CA — the system errs toward setting aside too much tax, never too little.
- **Tax rate** — the rate in force at the moment of sale (7.75% today). Because the rate is stored per order, historical records stay correct even after future rate changes.
- **Tax set-aside** — the exact dollar amount backed out of that sale's total, in cents. Zero for exempt sales.

**Historical orders are already classified.** Every past order was run through the same rules using its stored shipping address. One real sale (a $495 painting delivered to Indio, CA) had been mislabeled as international in the old system's data; the classification now trusts the actual delivery address, and that sale correctly carries a $35.60 set-aside.

**Test purchases don't pollute the numbers.** During Stripe setup over the years, eight $1 test purchases were made by the studio's own team. These are now flagged as test orders: hidden from the Orders page by default (a toggle reveals them), and excluded from all revenue and tax reporting. Any order can be marked or unmarked as a test from its detail panel, so the reports always reflect only real business.

> **The current book, after cleanup:** 2 real sales, $990 gross. One California sale carrying a $35.60 set-aside; one Washington sale, exempt. Every future sale classifies itself automatically at the moment of payment.

---

## Dashboards and Reports Available Today

**The Business dashboard** (`/admin/business`) shows, for any period — 30 days, 90 days, **This year** (built for filing season), 1 year, or all time:

- Net collected, gross, refunds, average order, and Stripe fees
- **Tax to set aside**, with the count of CA-taxable orders
- Checkout funnel (started → paid), delivery mix, and fulfillment queue
- An operational queue that surfaces anything needing attention — failed emails, disputed payments, mismatched records — with one-click fixes

**The downloadable report** (Export button on the Business page) is a spreadsheet-ready file with three sections:

1. **Summary** — every headline number for the selected period, including tax to set aside and the taxable/exempt order counts
2. **Sales by destination** — orders and gross per state, the annual nexus check at a glance
3. **Order detail** — one row per sale: date, artwork, delivery method, destination state, tax jurisdiction, rate, amount paid, shipping, and tax set aside

Section 3 is what your accountant wants at filing time: it maps directly onto the CDTFA return (gross sales, interstate/foreign deductions, taxable amount).

**What we could add if it would help** — none of this exists yet, but each is a small addition:

- A quarterly or year-end summary emailed to the studio automatically
- A CDTFA-shaped filing worksheet (pre-grouped into the return's line items)
- Per-district breakdown of California sales, if the accountant ever wants exact district allocation
- Direct exports formatted for QuickBooks or similar bookkeeping software

---

## What the Studio Needs to Do

1. **Confirm the model with your accountant.** The two things worth a professional's sign-off: the 7.75% single-rate policy for all California sales, and the treatment of shipping charges (currently included in the taxed total, the conservative choice).
2. **File with CDTFA as usual.** Report gross sales, deduct interstate and foreign sales, remit the set-aside on California sales. The export gives every number.
3. **Keep the "tax included" wording on the site.** It's what makes tax-inclusive pricing valid with California — it's in place today and shouldn't be removed in future copy changes.
4. **Once a year:** glance at the sales-by-state table with your accountant to confirm no economic-nexus exposure, and expect the site's rate to be re-verified each January and July.

---

_This document describes how the website records and reports sales for tax purposes. It is an operational plan, not tax or legal advice — final decisions on rates, filings, and deductions belong with the studio's accountant._

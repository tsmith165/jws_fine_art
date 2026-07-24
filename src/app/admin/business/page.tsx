import { AlertTriangle, ArrowRight, CheckCircle2, Download, Landmark, ReceiptText, RefreshCw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { Id } from '../../../../convex/_generated/dataModel';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { readOwnerBusiness } from '@/data/ownerWorkspaceReads';
import {
    resolveFinding,
    resolveQuarantine,
    retryConfirmation,
    retryStripeInbox,
    runStripeReconciliation,
} from '@/app/admin/business/actions';

export const dynamic = 'force-dynamic';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const moneyExact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const number = new Intl.NumberFormat('en-US');
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const ranges = [
    { key: '30', label: '30 days' },
    { key: '90', label: '90 days' },
    { key: 'year', label: 'This year' },
    { key: '365', label: '1 year' },
    { key: '3650', label: 'All time' },
] as const;

function daysSinceYearStart() {
    const now = new Date();
    return Math.max(1, Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (24 * 60 * 60 * 1000)));
}

function parseRange(value: string | undefined) {
    const key = ranges.some((item) => item.key === value) ? (value as (typeof ranges)[number]['key']) : '90';
    return { key, days: key === 'year' ? daysSinceYearStart() : Number(key) };
}

function dollars(cents: number | null | undefined) {
    return money.format((cents ?? 0) / 100);
}

export default async function OwnerBusinessPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const range = parseRange((await searchParams).range);
    const rangeDays = range.days;
    const business = await readOwnerBusiness(rangeDays);
    const urgentCount =
        business.operations.failedStripeEvents +
        business.operations.openQuarantines +
        business.operations.failedConfirmations +
        business.operations.openDisputes +
        business.operations.openReconciliationFindings;
    const activeRange = ranges.find((item) => item.key === range.key)?.label ?? '90 days';

    return (
        <OwnerShell active="/admin/business" title="Business">
            <section className="owner-content owner-business">
                <OwnerHeading
                    eyebrow="Business operations"
                    title={
                        urgentCount
                            ? `${urgentCount} ${urgentCount === 1 ? 'item needs' : 'items need'} review`
                            : 'The business is in order'
                    }
                    description={
                        urgentCount
                            ? 'Payments are still protected. Review the operational queue below so every Stripe event, order, and email is accounted for.'
                            : 'Payments, tax records, order delivery, and studio email are all reporting normally.'
                    }
                    action={
                        <form action={runStripeReconciliation.bind(null, rangeDays)}>
                            <button className="owner-button is-primary" type="submit">
                                <RefreshCw size={15} aria-hidden="true" /> Reconcile Stripe
                            </button>
                        </form>
                    }
                />

                <nav className="owner-business-toolbar" aria-label="Business reporting period">
                    <div className="owner-analytics-ranges">
                        {ranges.map((item) => (
                            <Link
                                key={item.key}
                                className={item.key === range.key ? 'is-active' : undefined}
                                href={`/admin/business?range=${item.key}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <Link className="owner-button" href={`/admin/business/export?range=${range.key}`}>
                        <Download size={15} aria-hidden="true" /> Export report
                    </Link>
                </nav>

                <section className="owner-business-hero-grid" aria-label={`Business summary for ${activeRange}`}>
                    <article className="owner-business-hero is-primary">
                        <span>
                            <Landmark size={17} aria-hidden="true" /> Net collected
                        </span>
                        <strong>{dollars(business.commerce.netCollectedCents)}</strong>
                        <p>
                            {activeRange} · before Stripe fees ·{' '}
                            {business.commerce.refundedCents ? `${dollars(business.commerce.refundedCents)} refunded` : 'no refunds'}
                        </p>
                    </article>
                    <article className="owner-business-hero">
                        <span>
                            <ShieldCheck size={17} aria-hidden="true" /> Tax to set aside
                        </span>
                        <strong>{moneyExact.format((business.commerce.taxSetAsideCents ?? 0) / 100)}</strong>
                        <p>
                            Included in listed prices · {number.format(business.commerce.taxJurisdictions.ca)} CA-taxable{' '}
                            {business.commerce.taxJurisdictions.ca === 1 ? 'order' : 'orders'}
                        </p>
                    </article>
                    <article className="owner-business-hero">
                        <span>
                            <ReceiptText size={17} aria-hidden="true" /> Orders
                        </span>
                        <strong>{number.format(business.commerce.orderCount)}</strong>
                        <p>
                            {business.commerce.orderCount
                                ? `${dollars(business.commerce.averageOrderCents)} average`
                                : 'No completed sales in this period'}
                        </p>
                    </article>
                </section>

                <div className="owner-business-grid">
                    <section className="owner-panel owner-business-financials">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Commerce</span>
                                <h2>What moved through checkout</h2>
                            </div>
                            <OwnerStatus tone={business.commerce.checkoutPaid ? 'good' : 'neutral'}>{activeRange}</OwnerStatus>
                        </header>
                        <dl className="owner-business-ledger">
                            <div>
                                <dt>Gross collected</dt>
                                <dd>{dollars(business.commerce.grossCents)}</dd>
                            </div>
                            <div className="is-subtract">
                                <dt>Refunds</dt>
                                <dd>− {dollars(business.commerce.refundedCents)}</dd>
                            </div>
                            <div className="is-total">
                                <dt>Net before fees</dt>
                                <dd>{dollars(business.commerce.netCollectedCents)}</dd>
                            </div>
                            <div className="is-context">
                                <dt>
                                    Insured shipping <small>portion of gross</small>
                                </dt>
                                <dd>{dollars(business.commerce.shippingCents)}</dd>
                            </div>
                            <div className="is-context">
                                <dt>
                                    Tax to set aside <small>portion of gross, owed to CDTFA</small>
                                </dt>
                                <dd>{moneyExact.format((business.commerce.taxSetAsideCents ?? 0) / 100)}</dd>
                            </div>
                            <div className="is-context">
                                <dt>
                                    Stripe fees{' '}
                                    <small>
                                        {business.operations.latestRun
                                            ? `last reconciliation, ${date.format(new Date(business.operations.latestRun.createdAt))} — its window may differ from this period`
                                            : 'run a reconciliation to record fees'}
                                    </small>
                                </dt>
                                <dd>{business.operations.latestRun ? dollars(business.operations.latestRun.feeCents) : '—'}</dd>
                            </div>
                        </dl>
                        <p className="owner-business-note">
                            This is an operational view, not an accounting ledger. Stripe remains the source of truth for payouts. Tax to
                            set aside is backed out of tax-inclusive listed prices for CA-taxable orders — see docs/PAYMENTS_AND_TAXES.md.
                            {business.commerce.testOrderCount > 0 &&
                                ` ${number.format(business.commerce.testOrderCount)} test ${
                                    business.commerce.testOrderCount === 1 ? 'order is' : 'orders are'
                                } excluded.`}
                        </p>
                    </section>

                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Checkout</span>
                                <h2>Collector completion</h2>
                            </div>
                            <strong className="owner-business-rate">{business.commerce.conversionPercent}%</strong>
                        </header>
                        <div className="owner-business-funnel">
                            <div>
                                <span>Started checkout</span>
                                <strong>{business.commerce.checkoutCreated}</strong>
                            </div>
                            <ArrowRight size={16} aria-hidden="true" />
                            <div>
                                <span>Paid</span>
                                <strong>{business.commerce.checkoutPaid}</strong>
                            </div>
                        </div>
                        <div className="owner-business-funnel-drop">
                            <span>Did not complete</span>
                            <p>
                                {business.commerce.checkoutCanceled} canceled · {business.commerce.checkoutExpired} expired
                            </p>
                        </div>
                        <div className="owner-business-delivery">
                            <span>Delivery mix</span>
                            <p>
                                {business.commerce.delivery.shipped} shipped · {business.commerce.delivery.pickup} pickup ·{' '}
                                {business.commerce.delivery.international} international quote
                            </p>
                        </div>
                    </section>
                </div>

                <div className="owner-business-grid">
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Trend</span>
                                <h2>Revenue by month</h2>
                            </div>
                            <OwnerStatus>Last 12 months</OwnerStatus>
                        </header>
                        {business.commerce.monthlyRevenue.some((month) => month.grossCents > 0) ? (
                            <div className="owner-business-trend" role="img" aria-label="Monthly revenue for the last twelve months">
                                {business.commerce.monthlyRevenue.map((month) => {
                                    const max = Math.max(...business.commerce.monthlyRevenue.map((entry) => entry.grossCents), 1);
                                    const height = month.grossCents ? Math.max(8, Math.round((month.grossCents / max) * 100)) : 2;
                                    const label = new Date(`${month.month}-15T00:00:00`).toLocaleDateString('en-US', { month: 'short' });
                                    return (
                                        <div className="owner-business-trend-column" key={month.month}>
                                            <strong>{month.grossCents ? money.format(month.grossCents / 100) : ''}</strong>
                                            <span
                                                className={`owner-business-trend-bar${month.grossCents ? '' : 'is-empty'}`}
                                                style={{ height: `${height}%` }}
                                                title={`${label}: ${money.format(month.grossCents / 100)} across ${month.orderCount} ${
                                                    month.orderCount === 1 ? 'order' : 'orders'
                                                }`}
                                            />
                                            <small>{label}</small>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="owner-business-note">No completed sales in the last twelve months yet.</p>
                        )}
                    </section>
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Recent sales</span>
                                <h2>Latest completed orders</h2>
                            </div>
                            <Link href="/admin/orders">Open orders</Link>
                        </header>
                        {business.commerce.orderRows.length ? (
                            <table className="owner-business-orders-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Date</th>
                                        <th scope="col">Artwork</th>
                                        <th scope="col">Destination</th>
                                        <th scope="col" className="is-amount">
                                            Amount
                                        </th>
                                        <th scope="col" className="is-amount">
                                            Tax set aside
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {business.commerce.orderRows.slice(0, 8).map((order, index) => (
                                        <tr key={`${order.purchasedOn}-${order.artworkTitle}-${index}`}>
                                            <td>{order.purchasedOn ?? '—'}</td>
                                            <td>{order.artworkTitle}</td>
                                            <td>
                                                {order.taxJurisdiction === 'international'
                                                    ? 'International'
                                                    : order.destinationState || '—'}
                                            </td>
                                            <td className="is-amount">{money.format(order.amountPaidCents / 100)}</td>
                                            <td className="is-amount">
                                                {order.taxJurisdiction === 'CA'
                                                    ? moneyExact.format(order.taxSetAsideCents / 100)
                                                    : 'Exempt'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="owner-business-note">No completed sales in this period.</p>
                        )}
                    </section>
                </div>

                <section className="owner-panel owner-business-operations">
                    <header className="owner-panel-header">
                        <div>
                            <span className="owner-panel-eyebrow">Operational queue</span>
                            <h2>{business.alerts.length ? 'Review these records' : 'No unresolved provider issues'}</h2>
                        </div>
                        <OwnerStatus tone={business.alerts.length ? 'warning' : 'good'}>{business.alerts.length}</OwnerStatus>
                    </header>
                    {business.alerts.length ? (
                        <div className="owner-business-alerts">
                            {business.alerts.map((alert) => (
                                <article className={`owner-business-alert is-${alert.severity}`} key={`${alert.type}-${alert.id}`}>
                                    <AlertTriangle size={17} aria-hidden="true" />
                                    <div>
                                        <strong>{alert.title}</strong>
                                        <p>{alert.detail}</p>
                                        <small>{date.format(new Date(alert.occurredAt))}</small>
                                    </div>
                                    {alert.type === 'stripe_inbox' ? (
                                        <form action={retryStripeInbox.bind(null, alert.id as Id<'stripeWebhookInbox'>)}>
                                            <button className="owner-button" type="submit">
                                                Retry
                                            </button>
                                        </form>
                                    ) : alert.type === 'confirmation' ? (
                                        <form action={retryConfirmation.bind(null, alert.id as Id<'notificationOutbox'>)}>
                                            <button className="owner-button" type="submit">
                                                Retry email
                                            </button>
                                        </form>
                                    ) : alert.type === 'quarantine' ? (
                                        <form action={resolveQuarantine} className="owner-business-resolution">
                                            <input type="hidden" name="quarantineId" value={alert.id} />
                                            <input name="note" aria-label="Resolution note" placeholder="Resolution note" />
                                            <button className="owner-button" name="resolution" value="resolved" type="submit">
                                                Resolve
                                            </button>
                                            <button className="owner-button" name="resolution" value="ignored" type="submit">
                                                Ignore
                                            </button>
                                        </form>
                                    ) : (
                                        <form action={resolveFinding} className="owner-business-resolution">
                                            <input type="hidden" name="findingId" value={alert.id} />
                                            <button className="owner-button" name="resolution" value="resolved" type="submit">
                                                Mark resolved
                                            </button>
                                            <button className="owner-button" name="resolution" value="ignored" type="submit">
                                                Ignore
                                            </button>
                                        </form>
                                    )}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="owner-business-clear">
                            <CheckCircle2 size={28} aria-hidden="true" />
                            <div>
                                <strong>Provider records are healthy</strong>
                                <p>Stripe events, confirmation emails, disputes, and reconciliation findings are clear.</p>
                            </div>
                        </div>
                    )}
                </section>

                <div className="owner-business-grid">
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Fulfillment</span>
                                <h2>Orders after payment</h2>
                            </div>
                            <Link href="/admin/orders">Open orders</Link>
                        </header>
                        <div className="owner-metrics owner-business-small-metrics">
                            <div className="owner-metric">
                                <span>Needs action</span>
                                <strong>{business.commerce.fulfillment.needsAttention}</strong>
                            </div>
                            <div className="owner-metric">
                                <span>In progress</span>
                                <strong>{business.commerce.fulfillment.inProgress}</strong>
                            </div>
                            <div className="owner-metric">
                                <span>Completed</span>
                                <strong>{business.commerce.fulfillment.completed}</strong>
                            </div>
                        </div>
                    </section>
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Reconciliation</span>
                                <h2>Stripe cross-check</h2>
                            </div>
                        </header>
                        {business.operations.latestRun ? (
                            <div className="owner-business-reconciliation">
                                <OwnerStatus tone={business.operations.latestRun.findingCount ? 'warning' : 'good'}>
                                    {business.operations.latestRun.status}
                                </OwnerStatus>
                                <strong>
                                    {business.operations.latestRun.findingCount
                                        ? `${business.operations.latestRun.findingCount} finding${
                                              business.operations.latestRun.findingCount === 1 ? '' : 's'
                                          }`
                                        : 'Stripe and studio records agree'}
                                </strong>
                                <p>
                                    Last checked {date.format(new Date(business.operations.latestRun.createdAt))}. Net after recorded Stripe
                                    fees: {dollars(business.operations.latestRun.netCents)}.
                                </p>
                            </div>
                        ) : (
                            <p className="owner-business-note">
                                Run the first reconciliation to cross-check recent Stripe payments and fees.
                            </p>
                        )}
                    </section>
                </div>
            </section>
        </OwnerShell>
    );
}

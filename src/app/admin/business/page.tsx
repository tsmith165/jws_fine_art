import { AlertTriangle, ArrowRight, CheckCircle2, Download, Landmark, MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
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
const number = new Intl.NumberFormat('en-US');
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const ranges = [
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
    { value: 365, label: '1 year' },
    { value: 3650, label: 'All time' },
] as const;

function parseRange(value: string | undefined) {
    const parsed = Number(value);
    return ranges.some((item) => item.value === parsed) ? parsed : 90;
}

function dollars(cents: number | null | undefined) {
    return money.format((cents ?? 0) / 100);
}

export default async function OwnerBusinessPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const rangeDays = parseRange((await searchParams).range);
    const business = await readOwnerBusiness(rangeDays);
    const urgentCount =
        business.operations.failedStripeEvents +
        business.operations.openQuarantines +
        business.operations.failedConfirmations +
        business.operations.openDisputes +
        business.operations.openReconciliationFindings;
    const activeRange = ranges.find((item) => item.value === rangeDays)?.label ?? '90 days';

    return (
        <OwnerShell active="/admin/business" title="Business">
            <section className="owner-content owner-business">
                <OwnerHeading
                    eyebrow="Business operations"
                    title={urgentCount ? `${urgentCount} ${urgentCount === 1 ? 'item needs' : 'items need'} review` : 'The business is in order'}
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
                        {ranges.map((range) => (
                            <Link
                                key={range.value}
                                className={range.value === rangeDays ? 'is-active' : undefined}
                                href={`/admin/business?range=${range.value}`}
                            >
                                {range.label}
                            </Link>
                        ))}
                    </div>
                    <Link className="owner-button" href={`/admin/business/export?range=${rangeDays}`}>
                        <Download size={15} aria-hidden="true" /> Export summary
                    </Link>
                </nav>

                <section className="owner-business-hero-grid" aria-label={`Business summary for ${activeRange}`}>
                    <article className="owner-business-hero">
                        <span>
                            <Landmark size={17} aria-hidden="true" /> Collected
                        </span>
                        <strong>{dollars(business.commerce.netCollectedCents)}</strong>
                        <p>
                            {number.format(business.commerce.orderCount)} orders · {dollars(business.commerce.refundedCents)} refunded
                        </p>
                    </article>
                    <article className="owner-business-hero">
                        <span>
                            <ShieldCheck size={17} aria-hidden="true" /> Tax recorded
                        </span>
                        <strong>{dollars(business.commerce.taxCents)}</strong>
                        <p>Stripe Tax amounts captured on completed orders.</p>
                    </article>
                    <article className="owner-business-hero">
                        <span>
                            <MailCheck size={17} aria-hidden="true" /> Audience health
                        </span>
                        <strong>{number.format(business.mailing.activeSubscribers)}</strong>
                        <p>
                            {business.mailing.deliveryPercent}% delivered · {business.mailing.complaintPercent}% complaints
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
                            <div>
                                <dt>Insured shipping</dt>
                                <dd>{dollars(business.commerce.shippingCents)}</dd>
                            </div>
                            <div>
                                <dt>Sales tax</dt>
                                <dd>{dollars(business.commerce.taxCents)}</dd>
                            </div>
                            <div>
                                <dt>Refunds</dt>
                                <dd>{dollars(business.commerce.refundedCents)}</dd>
                            </div>
                            <div>
                                <dt>Average order</dt>
                                <dd>{dollars(business.commerce.averageOrderCents)}</dd>
                            </div>
                            <div>
                                <dt>Stripe fees (last reconciliation)</dt>
                                <dd>{dollars(business.operations.latestRun?.feeCents)}</dd>
                            </div>
                        </dl>
                        <p className="owner-business-note">
                            This is an operational view, not an accounting ledger. Stripe remains the source of truth for payouts and tax
                            filings.
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
                                <span>Started</span>
                                <strong>{business.commerce.checkoutCreated}</strong>
                            </div>
                            <ArrowRight size={16} aria-hidden="true" />
                            <div>
                                <span>Paid</span>
                                <strong>{business.commerce.checkoutPaid}</strong>
                            </div>
                            <div>
                                <span>Canceled</span>
                                <strong>{business.commerce.checkoutCanceled}</strong>
                            </div>
                            <div>
                                <span>Expired</span>
                                <strong>{business.commerce.checkoutExpired}</strong>
                            </div>
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

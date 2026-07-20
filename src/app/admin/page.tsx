import { ArrowRight, ChevronRight, FileWarning, Inbox, PackageCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { OwnerPostHogSummary } from '@/components/owner/OwnerPostHogSummary';
import { readPostHogAnalytics } from '@/data/posthogAnalytics';
import { readOwnerDashboard } from '@/data/ownerWorkspaceReads';

export const dynamic = 'force-dynamic';

const number = new Intl.NumberFormat('en-US');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const orderDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function fulfillmentTone(value: string): 'neutral' | 'good' | 'warning' {
    if (value === 'needs_attention') return 'warning';
    if (value === 'untracked') return 'neutral';
    return 'good';
}

function fulfillmentLabel(value: string) {
    return value.replaceAll('_', ' ');
}

export default async function OwnerDashboardPage() {
    const [dashboard, posthog] = await Promise.all([readOwnerDashboard(), readPostHogAnalytics()]);
    const attention =
        Number(dashboard.ordersToFulfill > 0) + Number(dashboard.artwork.needsDetails > 0) + Number(dashboard.newInquiries > 0);
    return (
        <OwnerShell active="/admin" title="Today">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow={new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
                    title="Good morning, Jill."
                    description={
                        attention > 0
                            ? `${attention} ${attention === 1 ? 'area needs' : 'areas need'} attention before the studio day begins.`
                            : 'Everything is in order. The studio manager has no urgent items.'
                    }
                    action={
                        <Link className="owner-button is-primary" href="/admin/edit/new">
                            Add artwork <ArrowRight size={15} />
                        </Link>
                    }
                />
                <div className="owner-attention-grid">
                    <article className="owner-card">
                        <span>
                            <PackageCheck size={17} /> Fulfillment
                        </span>
                        <h2>{dashboard.ordersToFulfill ? `${dashboard.ordersToFulfill} order to prepare` : 'Orders are clear'}</h2>
                        <p>Paid orders stay here until packing and delivery are recorded.</p>
                        <Link href="/admin/orders">
                            Open orders <ArrowRight size={14} />
                        </Link>
                    </article>
                    <article className="owner-card">
                        <span>
                            <FileWarning size={17} /> Publishing
                        </span>
                        <h2>
                            {dashboard.artwork.needsDetails
                                ? `${dashboard.artwork.needsDetails} ${dashboard.artwork.needsDetails === 1 ? 'piece needs' : 'pieces need'} details`
                                : 'Catalog is complete'}
                        </h2>
                        <p>Missing dimensions, medium, or price can keep a piece from being ready to publish.</p>
                        <Link href="/admin/artwork?filter=needs-details">
                            Review artwork <ArrowRight size={14} />
                        </Link>
                    </article>
                    <article className="owner-card">
                        <span>
                            <Inbox size={17} /> Collectors
                        </span>
                        <h2>{dashboard.newInquiries ? `${dashboard.newInquiries} new conversations` : 'Inbox is clear'}</h2>
                        <p>Artwork, commission, and general questions arrive in one place.</p>
                        <Link href="/admin/inbox">
                            Open inbox <ArrowRight size={14} />
                        </Link>
                    </article>
                </div>
                <div className="owner-metrics" aria-label="Studio overview">
                    <div className="owner-metric">
                        <span>Active artwork</span>
                        <strong>{number.format(dashboard.artwork.active)}</strong>
                    </div>
                    <div className="owner-metric">
                        <span>Available now</span>
                        <strong>{number.format(dashboard.artwork.available)}</strong>
                    </div>
                    <div className="owner-metric">
                        <span>Mailing audience</span>
                        <strong>{number.format(dashboard.subscribers)}</strong>
                    </div>
                    <div className="owner-metric">
                        <span>Campaign drafts</span>
                        <strong>{number.format(dashboard.draftCampaigns)}</strong>
                    </div>
                </div>
                <div className="owner-dashboard-analytics">
                    <OwnerPostHogSummary analytics={posthog} compact />
                </div>
                <div className="owner-dashboard-lower">
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Collector inbox</span>
                                <h2>Recent inquiries</h2>
                            </div>
                            <Link href="/admin/inbox">View all</Link>
                        </header>
                        <ul className="owner-list">
                            {dashboard.recentInquiries.length ? (
                                dashboard.recentInquiries.map((item) => (
                                    <li key={item._id}>
                                        <div>
                                            <strong>{item.name}</strong>
                                            <p>{item.message}</p>
                                        </div>
                                        <OwnerStatus tone={item.status === 'new' ? 'warning' : 'neutral'}>{item.kind}</OwnerStatus>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <p>No inquiries yet.</p>
                                </li>
                            )}
                        </ul>
                    </section>
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Sales</span>
                                <h2>Recent orders</h2>
                            </div>
                            <Link className="owner-panel-link" href="/admin/orders">
                                View all <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </header>
                        <ul className="owner-recent-orders">
                            {dashboard.recentOrders.length ? (
                                dashboard.recentOrders.map((order, index) => (
                                    <li key={order._id}>
                                        <Link href={`/admin/orders?id=${order._id}`}>
                                            <span className="owner-recent-order-artwork" aria-hidden="true">
                                                {order.artworkImageUrl ? (
                                                    <Image src={order.artworkImageUrl} alt="" fill sizes="52px" quality={75} />
                                                ) : (
                                                    <>
                                                        <PackageCheck size={17} />
                                                        <small>{String(index + 1).padStart(2, '0')}</small>
                                                    </>
                                                )}
                                            </span>
                                            <span className="owner-recent-order-copy">
                                                <strong>{order.artworkTitle}</strong>
                                                <span>
                                                    <small>{order.buyerName}</small>
                                                    <small>{orderDate.format(new Date(order.createdAt))}</small>
                                                </span>
                                            </span>
                                            <span className="owner-recent-order-summary">
                                                <strong>
                                                    {money.format((order.amountPaidCents ?? order.legacyRecordedPriceCents ?? 0) / 100)}
                                                </strong>
                                                <OwnerStatus tone={fulfillmentTone(order.fulfillmentStatus)}>
                                                    {fulfillmentLabel(order.fulfillmentStatus)}
                                                </OwnerStatus>
                                            </span>
                                            <ChevronRight size={16} aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="owner-recent-orders-empty">
                                    <p>No orders yet.</p>
                                </li>
                            )}
                        </ul>
                    </section>
                </div>
            </section>
        </OwnerShell>
    );
}

import { PackageCheck } from 'lucide-react';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { readOwnerOrders } from '@/data/ownerWorkspaceReads';
import { updateFulfillment } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function fulfillmentLabel(value: string) {
    return value.replaceAll('_', ' ');
}

function fulfillmentTone(value: string): 'neutral' | 'good' | 'warning' {
    if (value === 'needs_attention') return 'warning';
    if (value === 'untracked') return 'neutral';
    return 'good';
}

export default async function OwnerOrdersPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const params = await searchParams;
    const orders = await readOwnerOrders();
    const selected = orders.find((order) => order._id === params.id) || orders[0];
    return (
        <OwnerShell active="/admin/orders" title="Orders">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Sales & fulfillment"
                    title="Orders"
                    description="Stripe-verified purchases, buyer details, and a simple packing workflow."
                />
                {selected ? (
                    <div className="owner-workspace-grid">
                        <aside className="owner-panel owner-order-list">
                            <header className="owner-panel-header">
                                <h2>All orders</h2>
                                <OwnerStatus>{orders.length}</OwnerStatus>
                            </header>
                            <div className="owner-order-rows">
                                {orders.map((order) => (
                                    <a
                                        className={`owner-select-row${selected._id === order._id ? 'is-selected' : ''}`}
                                        href={`/admin/orders?id=${order._id}`}
                                        key={order._id}
                                        aria-current={selected._id === order._id ? 'page' : undefined}
                                    >
                                        <span className="owner-order-row-copy">
                                            <strong>{order.artworkTitle}</strong>
                                            <small>{order.buyerName}</small>
                                            <small>{date.format(new Date(order.createdAt))}</small>
                                        </span>
                                        <span className="owner-order-row-summary">
                                            <strong>
                                                {money.format((order.amountPaidCents ?? order.legacyRecordedPriceCents ?? 0) / 100)}
                                            </strong>
                                            <OwnerStatus tone={fulfillmentTone(order.fulfillmentStatus)}>
                                                {fulfillmentLabel(order.fulfillmentStatus)}
                                            </OwnerStatus>
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </aside>
                        <article className="owner-panel owner-detail">
                            <header className="owner-order-detail-header">
                                <div>
                                    <span className="owner-panel-eyebrow">Order detail</span>
                                    <h2>{selected.artworkTitle}</h2>
                                    <p>Placed {date.format(new Date(selected.createdAt))}</p>
                                </div>
                                <OwnerStatus tone={fulfillmentTone(selected.fulfillmentStatus)}>
                                    {fulfillmentLabel(selected.fulfillmentStatus)}
                                </OwnerStatus>
                            </header>
                            <dl>
                                <div>
                                    <dt>Buyer</dt>
                                    <dd>{selected.buyerName}</dd>
                                </div>
                                <div>
                                    <dt>Amount paid</dt>
                                    <dd>{money.format((selected.amountPaidCents ?? selected.legacyRecordedPriceCents ?? 0) / 100)}</dd>
                                </div>
                                <div>
                                    <dt>Email</dt>
                                    <dd>{selected.buyerEmail}</dd>
                                </div>
                                <div>
                                    <dt>Phone</dt>
                                    <dd>{selected.buyerPhone || 'Not provided'}</dd>
                                </div>
                                <div>
                                    <dt>Payment</dt>
                                    <dd>{fulfillmentLabel(selected.status)}</dd>
                                </div>
                                <div>
                                    <dt>Placed</dt>
                                    <dd>{new Date(selected.createdAt).toLocaleDateString()}</dd>
                                </div>
                            </dl>
                            <section className="owner-shipping-address">
                                <span>Shipping address</span>
                                <address>{selected.shippingAddress || 'No shipping address was recorded.'}</address>
                            </section>
                            <form action={updateFulfillment} className="owner-fulfillment-form">
                                <input type="hidden" name="orderId" value={selected._id} />
                                <label className="owner-field">
                                    <span>Fulfillment status</span>
                                    <select name="status" defaultValue={selected.fulfillmentStatus}>
                                        <option value="needs_attention">Needs attention</option>
                                        <option value="packed">Packed</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="untracked">Untracked</option>
                                    </select>
                                </label>
                                <button className="owner-button is-primary" type="submit">
                                    <PackageCheck size={16} /> Save status
                                </button>
                                <p>Update this after packing, shipment, or delivery is confirmed.</p>
                            </form>
                        </article>
                    </div>
                ) : (
                    <section className="owner-panel" style={{ padding: 70, textAlign: 'center' }}>
                        <h2>No orders yet.</h2>
                    </section>
                )}
            </section>
        </OwnerShell>
    );
}

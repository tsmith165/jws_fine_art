import { PackageCheck } from 'lucide-react';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { readOwnerOrders } from '@/data/ownerWorkspaceReads';
import { updateFulfillment } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

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
                            {orders.map((order) => (
                                <a className="owner-select-row" href={`/admin/orders?id=${order._id}`} key={order._id}>
                                    <span>
                                        <strong>{order.artworkTitle}</strong>
                                        <small>{order.buyerName}</small>
                                    </span>
                                    <OwnerStatus tone={order.fulfillmentStatus === 'needs_attention' ? 'warning' : 'good'}>
                                        {order.fulfillmentStatus.replace('_', ' ')}
                                    </OwnerStatus>
                                </a>
                            ))}
                        </aside>
                        <article className="owner-panel owner-detail">
                            <span className="owner-panel-eyebrow">Order detail</span>
                            <h2>{selected.artworkTitle}</h2>
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
                                    <dd>{selected.status.replace('_', ' ')}</dd>
                                </div>
                                <div>
                                    <dt>Placed</dt>
                                    <dd>{new Date(selected.createdAt).toLocaleDateString()}</dd>
                                </div>
                            </dl>
                            <blockquote>{selected.shippingAddress || 'No shipping address was recorded.'}</blockquote>
                            <form action={updateFulfillment} className="owner-inline-form">
                                <input type="hidden" name="orderId" value={selected._id} />
                                <label className="owner-field" style={{ minWidth: 220 }}>
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

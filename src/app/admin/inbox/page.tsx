import { CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { readOwnerInquiries } from '@/data/ownerWorkspaceReads';
import { updateInquiryStatus } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export default async function OwnerInboxPage({ searchParams }: { searchParams: Promise<{ id?: string; kind?: string }> }) {
    const params = await searchParams;
    const inquiries = await readOwnerInquiries();
    const visible = params.kind ? inquiries.filter((inquiry) => inquiry.kind === params.kind) : inquiries;
    const selected = visible.find((inquiry) => inquiry._id === params.id) || visible[0];
    return (
        <OwnerShell active="/admin/inbox" title="Collector inbox">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Collector relationships"
                    title="Inbox"
                    description="Artwork, commission, and general questions arrive with the context needed to reply personally."
                />
                <div className="owner-toolbar">
                    <div className="owner-inline-form">
                        {['', 'artwork', 'commission', 'general'].map((kind) => (
                            <Link key={kind || 'all'} className="owner-button" href={kind ? `/admin/inbox?kind=${kind}` : '/admin/inbox'}>
                                {kind ? kind[0].toUpperCase() + kind.slice(1) : 'All'}
                            </Link>
                        ))}
                    </div>
                    <OwnerStatus tone="warning">{inquiries.filter((inquiry) => inquiry.status === 'new').length} new</OwnerStatus>
                </div>
                {selected ? (
                    <div className="owner-workspace-grid">
                        <aside className="owner-panel owner-inbox-list">
                            <header className="owner-panel-header">
                                <h2>Conversations</h2>
                                <OwnerStatus>{visible.length}</OwnerStatus>
                            </header>
                            {visible.map((inquiry) => (
                                <a
                                    className="owner-select-row"
                                    href={`/admin/inbox?id=${inquiry._id}${params.kind ? `&kind=${params.kind}` : ''}`}
                                    key={inquiry._id}
                                >
                                    <span>
                                        <strong>{inquiry.name}</strong>
                                        <small>{inquiry.message.slice(0, 74)}</small>
                                    </span>
                                    <OwnerStatus tone={inquiry.status === 'new' ? 'warning' : 'neutral'}>{inquiry.status}</OwnerStatus>
                                </a>
                            ))}
                        </aside>
                        <article className="owner-panel owner-detail">
                            <span className="owner-panel-eyebrow">{selected.kind} inquiry</span>
                            <h2>{selected.name}</h2>
                            <dl>
                                <div>
                                    <dt>Email</dt>
                                    <dd>{selected.email}</dd>
                                </div>
                                <div>
                                    <dt>Received</dt>
                                    <dd>{new Date(selected.createdAt).toLocaleString()}</dd>
                                </div>
                                <div>
                                    <dt>Phone</dt>
                                    <dd>{selected.phone || 'Not provided'}</dd>
                                </div>
                                <div>
                                    <dt>Source</dt>
                                    <dd>{selected.sourcePath}</dd>
                                </div>
                            </dl>
                            <blockquote>{selected.message}</blockquote>
                            <div className="owner-inline-form">
                                <a
                                    className="owner-button is-primary"
                                    href={`mailto:${selected.email}?subject=${encodeURIComponent('A note from Jill Weeks Smith Fine Art')}`}
                                >
                                    <Mail size={16} /> Reply by email
                                </a>
                                <form action={updateInquiryStatus} className="owner-inline-form">
                                    <input type="hidden" name="inquiryId" value={selected._id} />
                                    <input type="hidden" name="status" value={selected.status === 'closed' ? 'new' : 'closed'} />
                                    <button className="owner-button" type="submit">
                                        <CheckCircle2 size={16} /> {selected.status === 'closed' ? 'Reopen' : 'Close conversation'}
                                    </button>
                                </form>
                            </div>
                        </article>
                    </div>
                ) : (
                    <section className="owner-panel" style={{ padding: 70, textAlign: 'center' }}>
                        <h2>No inquiries in this view.</h2>
                    </section>
                )}
            </section>
        </OwnerShell>
    );
}

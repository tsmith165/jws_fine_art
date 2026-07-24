import { AlertTriangle, CheckCircle2, MailCheck, Plus, Search, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { OwnerCampaignComposer } from '@/components/owner/OwnerCampaignComposer';
import { OwnerCampaignSendControls } from '@/components/owner/OwnerCampaignSendControls';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { readOwnerCampaigns, readOwnerMailingOverview, readOwnerSubscribers } from '@/data/ownerWorkspaceReads';
import { updateSubscriberStatus } from '@/app/admin/mailing/actions';

export const dynamic = 'force-dynamic';

function campaignCopy(contentJson: string) {
    try {
        const value = JSON.parse(contentJson) as { headline?: string; body?: string };
        return { headline: value.headline || '', body: value.body || '' };
    } catch {
        return { headline: '', body: '' };
    }
}

function subscriberTone(status: string): 'good' | 'warning' | 'neutral' {
    if (status === 'subscribed') return 'good';
    if (status === 'suppressed') return 'warning';
    return 'neutral';
}

export default async function OwnerMailingPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string; campaign?: string; new?: string; q?: string }>;
}) {
    const params = await searchParams;
    const [campaigns, subscribers, health] = await Promise.all([readOwnerCampaigns(), readOwnerSubscribers(), readOwnerMailingOverview()]);
    const view = params.view || 'campaigns';
    const search = (params.q || '').trim().toLowerCase();
    const filteredSubscribers = subscribers.filter((subscriber) =>
        [subscriber.name, subscriber.email, subscriber.status, subscriber.consentSource]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(search)),
    );
    const selected = params.new
        ? undefined
        : campaigns.find((campaign) => campaign._id === params.campaign) || campaigns.find((campaign) => campaign.status === 'draft');
    const copy = selected ? campaignCopy(selected.contentJson) : { headline: '', body: '' };
    const lastWebhook = health.provider.lastWebhookAt ? new Date(health.provider.lastWebhookAt) : null;
    const attentionCount =
        health.campaigns.failed +
        health.delivery.failed +
        health.delivery.delayed +
        health.provider.failedWebhookEventsLast30Days +
        (lastWebhook ? 0 : 1);
    const providerNeedsReview = health.provider.failedWebhookEventsLast30Days > 0 || !lastWebhook;

    return (
        <OwnerShell active="/admin/mailing" title="Mailing">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Audience & campaigns"
                    title={
                        attentionCount
                            ? `${attentionCount} mailing ${attentionCount === 1 ? 'item needs' : 'items need'} review`
                            : 'Studio mail is ready'
                    }
                    description="Compose studio letters, test them first, and let durable delivery continue safely in the background."
                    action={
                        <Link className="owner-button is-primary" href="/admin/mailing?new=1">
                            <Plus size={16} /> New campaign
                        </Link>
                    }
                />

                <section className="owner-mail-health" aria-label="Mailing health">
                    <article>
                        <Users size={18} aria-hidden="true" />
                        <span>Subscribed audience</span>
                        <strong>{health.subscribers.active}</strong>
                        <small>
                            {health.subscribers.unsubscribed} unsubscribed · {health.subscribers.suppressed} suppressed
                        </small>
                    </article>
                    <article>
                        <MailCheck size={18} aria-hidden="true" />
                        <span>Delivery outcomes</span>
                        <strong>{health.delivery.delivered}</strong>
                        <small>
                            {health.delivery.bounced} bounced · {health.delivery.complained} complaints
                        </small>
                    </article>
                    <article className={providerNeedsReview ? 'has-warning' : undefined}>
                        {providerNeedsReview ? (
                            <AlertTriangle size={18} aria-hidden="true" />
                        ) : (
                            <ShieldCheck size={18} aria-hidden="true" />
                        )}
                        <span>Provider connection</span>
                        <strong>
                            {health.provider.failedWebhookEventsLast30Days ? 'Review' : lastWebhook ? 'Healthy' : 'Awaiting verification'}
                        </strong>
                        <small>
                            {lastWebhook
                                ? `Last verified event ${lastWebhook.toLocaleDateString()}`
                                : 'Awaiting the first verified Resend event'}
                        </small>
                    </article>
                </section>

                <nav className="owner-toolbar owner-mail-toolbar" aria-label="Mailing views">
                    <div className="owner-inline-form">
                        <Link className={`owner-button${view === 'campaigns' ? 'is-active' : ''}`} href="/admin/mailing?view=campaigns">
                            Campaigns ({campaigns.length})
                        </Link>
                        <Link className={`owner-button${view === 'audience' ? 'is-active' : ''}`} href="/admin/mailing?view=audience">
                            Audience ({health.subscribers.active})
                        </Link>
                    </div>
                    {view === 'audience' ? (
                        <form className="owner-search owner-mail-search" role="search">
                            <input type="hidden" name="view" value="audience" />
                            <Search size={16} aria-hidden="true" />
                            <input
                                name="q"
                                defaultValue={params.q || ''}
                                placeholder="Search name, email, or status"
                                aria-label="Search audience"
                            />
                        </form>
                    ) : null}
                </nav>

                {view === 'audience' ? (
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Consent & deliverability</span>
                                <h2>Audience</h2>
                                <p>
                                    Bounces and complaints are suppressed automatically. Restore an address only after confirming it is safe
                                    to email.
                                </p>
                            </div>
                            <OwnerStatus>{filteredSubscribers.length}</OwnerStatus>
                        </header>
                        {filteredSubscribers.length ? (
                            <div className="owner-audience-list">
                                {filteredSubscribers.map((subscriber) => (
                                    <article className="owner-audience-row" key={subscriber._id}>
                                        <div>
                                            <strong>{subscriber.name || subscriber.email}</strong>
                                            <p>{subscriber.email}</p>
                                            <small>
                                                Joined through {subscriber.consentSource}
                                                {subscriber.suppressionReason ? ` · ${subscriber.suppressionReason}` : ''}
                                            </small>
                                        </div>
                                        <OwnerStatus tone={subscriberTone(subscriber.status)}>{subscriber.status}</OwnerStatus>
                                        <form action={updateSubscriberStatus} className="owner-audience-actions">
                                            <input type="hidden" name="subscriberId" value={subscriber._id} />
                                            <input
                                                name="reason"
                                                aria-label="Reason for subscriber status change"
                                                placeholder={subscriber.status === 'subscribed' ? 'Suppression reason' : 'Restore note'}
                                            />
                                            {subscriber.status === 'subscribed' ? (
                                                <button className="owner-button" name="status" value="suppressed" type="submit">
                                                    Suppress
                                                </button>
                                            ) : (
                                                <button className="owner-button" name="status" value="subscribed" type="submit">
                                                    Restore
                                                </button>
                                            )}
                                        </form>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="owner-business-clear">
                                <CheckCircle2 size={25} aria-hidden="true" />
                                <div>
                                    <strong>No audience records match this search.</strong>
                                    <p>Try a name, email, consent source, or status.</p>
                                </div>
                            </div>
                        )}
                    </section>
                ) : (
                    <div className="owner-workspace-grid owner-mail-workspace">
                        <aside className="owner-panel owner-campaign-list">
                            <header className="owner-panel-header">
                                <h2>Campaigns</h2>
                                <OwnerStatus>{campaigns.length}</OwnerStatus>
                            </header>
                            {campaigns.length ? (
                                <div className="owner-campaign-rows">
                                    {campaigns.map((campaign) => (
                                        <a
                                            className={`owner-select-row${selected?._id === campaign._id ? 'is-selected' : ''}`}
                                            href={`/admin/mailing?campaign=${campaign._id}`}
                                            key={campaign._id}
                                        >
                                            <span>
                                                <strong>{campaign.name}</strong>
                                                <small>{campaign.subject}</small>
                                                {campaign.outcomes.total ? (
                                                    <small>
                                                        {campaign.outcomes.delivered} delivered · {campaign.outcomes.failed} failed
                                                    </small>
                                                ) : null}
                                            </span>
                                            <OwnerStatus
                                                tone={
                                                    campaign.status === 'sent'
                                                        ? 'good'
                                                        : campaign.status === 'failed'
                                                          ? 'warning'
                                                          : 'neutral'
                                                }
                                            >
                                                {campaign.status}
                                            </OwnerStatus>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="owner-campaign-empty">
                                    <span>No campaigns yet</span>
                                    <p>Your saved drafts and sent studio letters will stay organized here.</p>
                                    <Link className="owner-button" href="/admin/mailing?new=1">
                                        <Plus size={15} aria-hidden="true" /> Start a draft
                                    </Link>
                                </div>
                            )}
                        </aside>
                        <div>
                            <OwnerCampaignComposer
                                key={selected?._id || 'new'}
                                campaign={
                                    selected
                                        ? {
                                              id: selected._id,
                                              name: selected.name,
                                              subject: selected.subject,
                                              previewText: selected.previewText,
                                              headline: copy.headline,
                                              body: copy.body,
                                              status: selected.status,
                                          }
                                        : undefined
                                }
                            />
                            {selected && ['draft', 'failed'].includes(selected.status) ? (
                                <OwnerCampaignSendControls
                                    campaignId={selected._id}
                                    audienceCount={health.subscribers.active}
                                    defaultTestEmail="jwsfineart@gmail.com"
                                />
                            ) : selected?.status === 'sending' ? (
                                <section className="owner-campaign-delivery-controls">
                                    <OwnerStatus tone="warning">Delivery in progress</OwnerStatus>
                                    <p>
                                        {selected.outcomes.queued} remaining · {selected.outcomes.accepted} accepted ·{' '}
                                        {selected.outcomes.failed} failed
                                    </p>
                                </section>
                            ) : null}
                        </div>
                    </div>
                )}
            </section>
        </OwnerShell>
    );
}

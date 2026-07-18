import { Plus, Send } from 'lucide-react';
import Link from 'next/link';
import { OwnerHeading, OwnerShell, OwnerStatus } from '@/components/owner/OwnerShell';
import { readOwnerCampaigns, readOwnerSubscribers } from '@/data/ownerWorkspaceReads';
import { saveCampaign } from '@/app/admin/actions';
import { sendCampaign } from '@/app/admin/mailing/actions';

export const dynamic = 'force-dynamic';

function campaignCopy(contentJson: string) {
    try {
        const value = JSON.parse(contentJson) as { headline?: string; body?: string };
        return { headline: value.headline || '', body: value.body || '' };
    } catch {
        return { headline: '', body: '' };
    }
}

export default async function OwnerMailingPage({
    searchParams,
}: {
    searchParams: Promise<{ view?: string; campaign?: string; new?: string }>;
}) {
    const params = await searchParams;
    const [campaigns, subscribers] = await Promise.all([readOwnerCampaigns(), readOwnerSubscribers()]);
    const view = params.view || 'campaigns';
    const selected = params.new
        ? undefined
        : campaigns.find((campaign) => campaign._id === params.campaign) || campaigns.find((campaign) => campaign.status === 'draft');
    const copy = selected ? campaignCopy(selected.contentJson) : { headline: '', body: '' };
    return (
        <OwnerShell active="/admin/mailing" title="Mailing">
            <section className="owner-content">
                <OwnerHeading
                    eyebrow="Audience & campaigns"
                    title="Studio mail"
                    description="Own the mailing list, keep consent history, and compose useful studio letters without leaving the site."
                    action={
                        <Link className="owner-button is-primary" href="/admin/mailing?new=1">
                            <Plus size={16} /> New campaign
                        </Link>
                    }
                />
                <nav className="owner-toolbar" aria-label="Mailing views">
                    <div className="owner-inline-form">
                        <Link className="owner-button" href="/admin/mailing?view=campaigns">
                            Campaigns ({campaigns.length})
                        </Link>
                        <Link className="owner-button" href="/admin/mailing?view=audience">
                            Audience ({subscribers.filter((subscriber) => subscriber.status === 'subscribed').length})
                        </Link>
                    </div>
                </nav>
                {view === 'audience' ? (
                    <section className="owner-panel">
                        <header className="owner-panel-header">
                            <div>
                                <span className="owner-panel-eyebrow">Consent ledger</span>
                                <h2>Audience</h2>
                            </div>
                        </header>
                        <div className="owner-list">
                            {subscribers.map((subscriber) => (
                                <div className="owner-table-row" key={subscriber._id}>
                                    <div>
                                        <strong>{subscriber.name || subscriber.email}</strong>
                                        <p>{subscriber.email}</p>
                                        <small>{subscriber.consentSource}</small>
                                    </div>
                                    <OwnerStatus tone={subscriber.status === 'subscribed' ? 'good' : 'neutral'}>
                                        {subscriber.status}
                                    </OwnerStatus>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className="owner-workspace-grid">
                        <aside className="owner-panel owner-campaign-list">
                            <header className="owner-panel-header">
                                <h2>Campaigns</h2>
                                <OwnerStatus>{campaigns.length}</OwnerStatus>
                            </header>
                            {campaigns.map((campaign) => (
                                <a className="owner-select-row" href={`/admin/mailing?campaign=${campaign._id}`} key={campaign._id}>
                                    <span>
                                        <strong>{campaign.name}</strong>
                                        <small>{campaign.subject}</small>
                                    </span>
                                    <OwnerStatus
                                        tone={campaign.status === 'sent' ? 'good' : campaign.status === 'failed' ? 'warning' : 'neutral'}
                                    >
                                        {campaign.status}
                                    </OwnerStatus>
                                </a>
                            ))}
                        </aside>
                        <section className="owner-panel">
                            <form action={saveCampaign} className="owner-form-grid">
                                <input type="hidden" name="campaignId" value={selected?.status === 'draft' ? selected._id : ''} />
                                <label className="owner-field">
                                    <span>Campaign name</span>
                                    <input name="name" defaultValue={selected?.name || ''} required placeholder="July studio note" />
                                </label>
                                <label className="owner-field">
                                    <span>Subject line</span>
                                    <input
                                        name="subject"
                                        defaultValue={selected?.subject || ''}
                                        required
                                        placeholder="New work from the coast"
                                    />
                                </label>
                                <label className="owner-field is-wide">
                                    <span>Preview text</span>
                                    <input
                                        name="previewText"
                                        defaultValue={selected?.previewText || ''}
                                        placeholder="A short introduction visible in the inbox"
                                    />
                                </label>
                                <label className="owner-field is-wide">
                                    <span>Headline</span>
                                    <input name="headline" defaultValue={copy.headline} required placeholder="From the studio this month" />
                                </label>
                                <label className="owner-field is-wide">
                                    <span>Message</span>
                                    <textarea
                                        name="body"
                                        defaultValue={copy.body}
                                        required
                                        placeholder="Share the story behind the work..."
                                    />
                                </label>
                                <button
                                    className="owner-button is-primary"
                                    type="submit"
                                    disabled={Boolean(selected && selected.status !== 'draft')}
                                >
                                    Save draft
                                </button>
                            </form>
                            <div className="owner-mail-preview" style={{ marginTop: 22 }}>
                                <span>Jill Weeks Smith Fine Art</span>
                                <h2>{copy.headline || 'A note from Jill’s studio'}</h2>
                                <p>
                                    {copy.body ||
                                        'Write the story behind the work, share what is new, and invite the reader to look closer.'}
                                </p>
                            </div>
                            {selected && ['draft', 'failed'].includes(selected.status) ? (
                                <form action={sendCampaign.bind(null, selected._id)} style={{ marginTop: 16 }}>
                                    <button className="owner-button" type="submit">
                                        <Send size={16} /> Send to subscribed audience
                                    </button>
                                </form>
                            ) : null}
                        </section>
                    </div>
                )}
            </section>
        </OwnerShell>
    );
}

'use client';

import { Save } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveCampaign } from '@/app/admin/actions';

type CampaignDraft = {
    id: string;
    name: string;
    subject: string;
    previewText: string;
    headline: string;
    body: string;
    status: string;
};

function SaveDraftButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <button className="owner-button is-primary owner-campaign-save" type="submit" disabled={disabled || pending}>
            <Save size={16} aria-hidden="true" />
            {pending ? 'Saving draft...' : 'Save draft'}
        </button>
    );
}

export function OwnerCampaignComposer({ campaign }: { campaign?: CampaignDraft }) {
    const [name, setName] = useState(campaign?.name || '');
    const [subject, setSubject] = useState(campaign?.subject || '');
    const [previewText, setPreviewText] = useState(campaign?.previewText || '');
    const [headline, setHeadline] = useState(campaign?.headline || '');
    const [body, setBody] = useState(campaign?.body || '');
    const locked = Boolean(campaign && campaign.status !== 'draft');

    return (
        <section className="owner-panel owner-campaign-editor">
            <header className="owner-campaign-editor-header">
                <div>
                    <span className="owner-panel-eyebrow">Campaign composer</span>
                    <h2>{campaign ? campaign.name : 'New studio letter'}</h2>
                    <p>
                        {locked
                            ? 'Sent campaigns are preserved as a read-only record.'
                            : 'Draft the message and review the email as you write.'}
                    </p>
                </div>
                <span className="owner-live-preview-indicator">Live preview</span>
            </header>
            <div className="owner-campaign-composer">
                <form action={saveCampaign} className="owner-campaign-form">
                    <input type="hidden" name="campaignId" value={campaign?.status === 'draft' ? campaign.id : ''} />
                    <label className="owner-field">
                        <span>Campaign name</span>
                        <input
                            name="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            disabled={locked}
                            placeholder="July studio note"
                        />
                        <small>Only visible in the studio manager.</small>
                    </label>
                    <label className="owner-field">
                        <span>Subject line</span>
                        <input
                            name="subject"
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                            required
                            disabled={locked}
                            placeholder="New work from the coast"
                        />
                    </label>
                    <label className="owner-field">
                        <span>Preview text</span>
                        <input
                            name="previewText"
                            value={previewText}
                            onChange={(event) => setPreviewText(event.target.value)}
                            disabled={locked}
                            placeholder="A short introduction visible in the inbox"
                        />
                        <small>A short line shown beside the subject in most inboxes.</small>
                    </label>
                    <label className="owner-field">
                        <span>Email headline</span>
                        <input
                            name="headline"
                            value={headline}
                            onChange={(event) => setHeadline(event.target.value)}
                            required
                            disabled={locked}
                            placeholder="From the studio this month"
                        />
                    </label>
                    <label className="owner-field">
                        <span>Message</span>
                        <textarea
                            name="body"
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            required
                            disabled={locked}
                            placeholder="Share the story behind the work..."
                        />
                    </label>
                    <SaveDraftButton disabled={locked} />
                </form>
                <aside className="owner-campaign-preview" aria-live="polite">
                    <div className="owner-campaign-inbox-preview">
                        <span>Inbox preview</span>
                        <strong>{subject || 'Your subject line will appear here'}</strong>
                        <p>{previewText || 'Add preview text to give readers a reason to open the message.'}</p>
                    </div>
                    <div className="owner-mail-preview">
                        <span>Jill Weeks Smith Fine Art</span>
                        <h2>{headline || 'A note from Jill’s studio'}</h2>
                        <p>{body || 'Write the story behind the work, share what is new, and invite the reader to look closer.'}</p>
                        <span className="owner-mail-preview-cta">View the collection</span>
                    </div>
                </aside>
            </div>
        </section>
    );
}

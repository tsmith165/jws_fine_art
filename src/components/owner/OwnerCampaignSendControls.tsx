'use client';

import { FlaskConical, Send } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { sendCampaign, sendCampaignTest } from '@/app/admin/mailing/actions';

export function OwnerCampaignSendControls({
    campaignId,
    audienceCount,
    defaultTestEmail,
}: {
    campaignId: Id<'campaigns'>;
    audienceCount: number;
    defaultTestEmail: string;
}) {
    return (
        <section className="owner-campaign-delivery-controls" aria-label="Campaign delivery controls">
            <form action={sendCampaignTest.bind(null, campaignId)} className="owner-campaign-test-form">
                <label className="owner-field">
                    <span>Test recipient</span>
                    <input name="testEmail" type="email" required defaultValue={defaultTestEmail} />
                </label>
                <button className="owner-button" type="submit">
                    <FlaskConical size={15} aria-hidden="true" /> Send test
                </button>
            </form>
            <form
                action={sendCampaign.bind(null, campaignId)}
                onSubmit={(event) => {
                    if (
                        !window.confirm(
                            `Send this campaign to ${audienceCount} subscribed ${audienceCount === 1 ? 'collector' : 'collectors'}? This starts durable delivery and cannot be undone.`,
                        )
                    ) {
                        event.preventDefault();
                    }
                }}
            >
                <button className="owner-button is-primary" type="submit" disabled={audienceCount === 0}>
                    <Send size={16} aria-hidden="true" /> Send to {audienceCount} subscribed
                </button>
            </form>
            <p>Send a test first. Real delivery is queued safely and continues even if this page closes.</p>
        </section>
    );
}

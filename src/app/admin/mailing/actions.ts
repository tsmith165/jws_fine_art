'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';
import { sendEmail } from '@/utils/emails/resend_utils';

export async function sendCampaign(campaignId: Id<'campaigns'>): Promise<void> {
    const client = await getAuthenticatedOwnerConvexClient('send a campaign');
    await client.mutation(api.ownerWorkspace.beginCampaignSend, { campaignId });
    revalidatePath('/admin/mailing');
}

export async function sendCampaignTest(campaignId: Id<'campaigns'>, formData: FormData): Promise<void> {
    const email = String(formData.get('testEmail') || '')
        .trim()
        .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid test recipient email.');
    const client = await getAuthenticatedOwnerConvexClient('send a campaign test');
    const campaigns = await client.query(api.ownerWorkspace.listCampaigns, {});
    const campaign = campaigns.find((item) => item._id === campaignId);
    if (!campaign) throw new Error('Campaign not found.');
    await sendEmail(
        {
            from: 'JWS Fine Art <contact@jwsfineart.com>',
            to: email,
            subject: `[TEST] ${campaign.subject}`,
            html: campaign.renderedHtml,
            text: campaign.renderedText || campaign.subject,
            headers: { 'X-JWS-Campaign-Test': String(campaign._id) },
        },
        { idempotencyKey: `campaign-test-${campaign._id}-${randomUUID()}` },
    );
    revalidatePath('/admin/mailing');
}

export async function updateSubscriberStatus(formData: FormData): Promise<void> {
    const status = String(formData.get('status')) as 'subscribed' | 'unsubscribed' | 'suppressed';
    if (!['subscribed', 'unsubscribed', 'suppressed'].includes(status)) throw new Error('Invalid subscriber status.');
    const client = await getAuthenticatedOwnerConvexClient('update a mailing subscriber');
    await client.mutation(api.ownerWorkspace.updateSubscriberStatus, {
        subscriberId: String(formData.get('subscriberId')) as Id<'subscribers'>,
        status,
        reason: String(formData.get('reason') || ''),
    });
    revalidatePath('/admin/mailing');
}

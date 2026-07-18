'use server';

import { revalidatePath } from 'next/cache';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';
import { sendBatchEmails } from '@/utils/emails/resend_utils';

function chunks<T>(items: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

export async function sendCampaign(campaignId: Id<'campaigns'>): Promise<void> {
    const client = await getAuthenticatedOwnerConvexClient('send a campaign');
    const campaign = await client.mutation(api.ownerWorkspace.beginCampaignSend, { campaignId });

    for (const recipients of chunks(campaign.recipients, 100)) {
        try {
            const messages = await sendBatchEmails(
                recipients.map((recipient) => ({
                    from: 'JWS Fine Art <contact@jwsfineart.com>',
                    to: recipient.email,
                    subject: campaign.subject,
                    html: campaign.renderedHtml,
                })),
            );
            await Promise.all(
                recipients.map((recipient, index) =>
                    client.mutation(api.ownerWorkspace.recordCampaignRecipientOutcome, {
                        recipientId: recipient.recipientId,
                        outcome: 'sent',
                        providerMessageId: messages[index]?.id ?? null,
                    }),
                ),
            );
        } catch {
            await Promise.all(
                recipients.map((recipient) =>
                    client.mutation(api.ownerWorkspace.recordCampaignRecipientOutcome, {
                        recipientId: recipient.recipientId,
                        outcome: 'failed',
                        providerMessageId: null,
                    }),
                ),
            );
        }
    }

    const result = await client.mutation(api.ownerWorkspace.completeCampaignSend, { campaignId });
    revalidatePath('/admin/mailing');
    if (result.status === 'failed') throw new Error('One or more campaign messages could not be sent.');
}

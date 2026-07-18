'use server';

import type { Id } from '../../../convex/_generated/dataModel';
import { api } from '../../../convex/_generated/api';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';

function revalidateOwner(...paths: string[]) {
    revalidatePath('/admin');
    for (const path of paths) revalidatePath(path);
}

export async function updateInquiryStatus(formData: FormData) {
    const inquiryId = String(formData.get('inquiryId')) as Id<'inquiries'>;
    const status = String(formData.get('status')) as 'new' | 'replied' | 'closed';
    if (!['new', 'replied', 'closed'].includes(status)) throw new Error('Invalid inquiry status.');
    const client = await getAuthenticatedOwnerConvexClient('update an inquiry');
    await client.mutation(api.ownerWorkspace.updateInquiryStatus, { inquiryId, status });
    revalidateOwner('/admin/inbox');
}

export async function updateFulfillment(formData: FormData) {
    const orderId = String(formData.get('orderId')) as Id<'orders'>;
    const status = String(formData.get('status')) as 'untracked' | 'needs_attention' | 'packed' | 'shipped' | 'delivered';
    if (!['untracked', 'needs_attention', 'packed', 'shipped', 'delivered'].includes(status)) {
        throw new Error('Invalid fulfillment status.');
    }
    const client = await getAuthenticatedOwnerConvexClient('update fulfillment');
    await client.mutation(api.ownerWorkspace.updateFulfillment, { orderId, status });
    revalidateOwner('/admin/orders');
}

function escapeHtml(value: string) {
    return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}

export async function saveCampaign(formData: FormData) {
    const campaignId = (String(formData.get('campaignId') || '') || null) as Id<'campaigns'> | null;
    const name = String(formData.get('name') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const previewText = String(formData.get('previewText') || '').trim();
    const headline = String(formData.get('headline') || '').trim();
    const body = String(formData.get('body') || '').trim();
    if (!name || !subject || !headline || !body) throw new Error('Campaign name, subject, headline, and message are required.');
    const renderedHtml = `<!doctype html><html><body style="margin:0;background:#101310;color:#f3efe6;font-family:Arial,sans-serif"><div style="display:none">${escapeHtml(previewText)}</div><main style="max-width:640px;margin:auto;padding:48px 28px"><p style="color:#c6a466;font-size:12px;letter-spacing:2px;text-transform:uppercase">Jill Weeks Smith Fine Art</p><h1 style="font-family:Georgia,serif;font-size:42px;font-weight:400;line-height:1.1">${escapeHtml(headline)}</h1><p style="font-size:17px;line-height:1.7;color:#d7dbd4">${escapeHtml(body).replace(/\n/g, '<br>')}</p><p style="margin-top:40px"><a href="https://www.jwsfineart.com/work" style="display:inline-block;background:#c6a466;color:#17140f;padding:14px 20px;text-decoration:none;font-weight:700">View the collection</a></p></main></body></html>`;
    const client = await getAuthenticatedOwnerConvexClient('save a campaign');
    await client.mutation(api.ownerWorkspace.saveCampaign, {
        campaignId,
        name,
        subject,
        previewText,
        contentJson: JSON.stringify({ headline, body }),
        renderedHtml,
    });
    revalidateOwner('/admin/mailing');
}

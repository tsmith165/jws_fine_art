import { Resend, type WebhookEventPayload } from 'resend';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';

export const dynamic = 'force-dynamic';

function eventSummary(event: WebhookEventPayload) {
    if (!event.type.startsWith('email.')) return {};
    const data = event.data;
    if ('bounce' in data) {
        return { bounceType: data.bounce.type, bounceSubType: data.bounce.subType, message: data.bounce.message };
    }
    if ('failed' in data) return { reason: data.failed.reason };
    if ('suppressed' in data) return { type: data.suppressed.type, message: data.suppressed.message };
    return { state: event.type.replace('email.', '') };
}

export async function POST(request: Request) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) return Response.json({ error: 'Resend webhook is not configured.' }, { status: 503 });
    const id = request.headers.get('svix-id');
    const timestamp = request.headers.get('svix-timestamp');
    const signature = request.headers.get('svix-signature');
    if (!id || !timestamp || !signature) return Response.json({ error: 'Webhook headers are incomplete.' }, { status: 400 });

    let event: WebhookEventPayload;
    try {
        const resend = new Resend(process.env.RESEND_API_KEY || 're_webhook_verification_only');
        event = resend.webhooks.verify({
            payload: await request.text(),
            headers: { id, timestamp, signature },
            webhookSecret,
        });
    } catch (error) {
        console.error('Resend webhook signature verification failed.', error);
        return Response.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    const providerMessageId = 'email_id' in event.data ? event.data.email_id : null;
    const tags = 'tags' in event.data ? event.data.tags : undefined;
    const eventAt = Date.parse(event.created_at);
    try {
        const { client, serverSecret } = getServerConvexClient();
        const result = await client.mutation(api.mailing.processResendWebhook, {
            serverSecret,
            svixId: id,
            eventType: event.type,
            providerMessageId,
            campaignRecipientId: tags?.recipient_id ?? null,
            notificationOutboxId: tags?.outbox_id ?? null,
            eventAt: Number.isFinite(eventAt) ? eventAt : null,
            summaryJson: JSON.stringify(eventSummary(event)),
        });
        return Response.json({ received: true, outcome: result.outcome });
    } catch (error) {
        console.error('Resend webhook could not be durably recorded.', error);
        return Response.json({ error: 'Webhook intake failed.' }, { status: 503 });
    }
}

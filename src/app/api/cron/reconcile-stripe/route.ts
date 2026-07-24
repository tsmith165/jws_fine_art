import { api } from '../../../../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';
import { collectStripePaymentSnapshots, stripeReconciliationLivemode } from '@/lib/stripeReconciliation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return Response.json({ error: 'Scheduled reconciliation is not configured.' }, { status: 503 });
    if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
        return Response.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const end = Date.now();
    const start = end - 90 * 24 * 60 * 60 * 1000;
    const { client, serverSecret } = getServerConvexClient();
    const runId = await client.mutation(api.ownerBusiness.beginReconciliationFromServer, {
        serverSecret,
        livemode: stripeReconciliationLivemode(),
        stripeWindowStart: start,
        stripeWindowEnd: end,
    });
    try {
        const snapshots = await collectStripePaymentSnapshots(start, end);
        const result = await client.mutation(api.ownerBusiness.completeReconciliationFromServer, {
            serverSecret,
            runId,
            payments: snapshots.payments,
        });
        return Response.json({ success: true, findings: result.findings });
    } catch (error) {
        await client.mutation(api.ownerBusiness.failReconciliationFromServer, {
            serverSecret,
            runId,
            error: error instanceof Error ? error.message : 'Unknown reconciliation error.',
        });
        return Response.json({ error: 'Reconciliation failed.' }, { status: 500 });
    }
}

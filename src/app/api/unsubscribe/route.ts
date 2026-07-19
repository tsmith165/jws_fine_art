import { api } from '../../../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';
import { readUnsubscribeToken } from '@/lib/unsubscribe';

export async function POST(request: Request) {
    const token = new URL(request.url).searchParams.get('token') || '';
    const email = readUnsubscribeToken(token);
    if (!email) return Response.json({ error: 'Invalid unsubscribe token.' }, { status: 400 });
    const { client, serverSecret } = getServerConvexClient();
    await client.mutation(api.publicWrites.unsubscribe, { serverSecret, email, source: 'one-click' });
    return Response.json({ success: true });
}

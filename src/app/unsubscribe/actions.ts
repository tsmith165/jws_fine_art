'use server';

import { api } from '../../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';
import { readUnsubscribeToken } from '@/lib/unsubscribe';

export async function confirmUnsubscribe(token: string): Promise<{ success: boolean; message: string }> {
    const email = readUnsubscribeToken(token);
    if (!email) return { success: false, message: 'This unsubscribe link is invalid.' };
    const { client, serverSecret } = getServerConvexClient();
    await client.mutation(api.publicWrites.unsubscribe, { serverSecret, email, source: 'mailing-link' });
    return { success: true, message: 'You have been removed from the JWS Fine Art mailing list.' };
}

import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { requireAdmin } from '@/utils/auth/requireAdmin';

export async function getAuthenticatedOwnerConvexClient(action = 'manage owner data'): Promise<ConvexHttpClient> {
    const result = await requireAdmin(action);
    if (!result.isAdmin) throw new Error(result.error);
    const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!deploymentUrl) throw new Error('NEXT_PUBLIC_CONVEX_URL is required for owner operations.');
    const { getToken } = await auth();
    const token = await getToken({ template: 'convex' });
    if (!token) throw new Error('Unable to create the Clerk token required for owner operations.');
    const client = new ConvexHttpClient(deploymentUrl);
    client.setAuth(token);
    return client;
}

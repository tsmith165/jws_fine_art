import 'server-only';
import { clerkClient, getAuth } from '@clerk/nextjs/server';

export async function requireAdminRequest(request: Parameters<typeof getAuth>[0]) {
    const { userId } = getAuth(request);
    if (!userId) throw new Error('Owner access is required.');
    const user = await (await clerkClient()).users.getUser(userId);
    if (user.publicMetadata.role !== 'ADMIN') throw new Error('Owner access is required.');
    return userId;
}

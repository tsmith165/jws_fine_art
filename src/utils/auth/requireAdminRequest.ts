import 'server-only';
import { getAuth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from './ClerkUtils';

export async function requireAdminRequest(request: Parameters<typeof getAuth>[0]) {
    const { userId } = getAuth(request);
    if (!userId || !(await isClerkUserIdAdmin(userId))) throw new Error('Owner access is required.');
    return userId;
}

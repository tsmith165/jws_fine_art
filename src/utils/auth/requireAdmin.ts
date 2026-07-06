'use server';

import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

export async function requireAdmin(action = 'perform this action'): Promise<{ isAdmin: boolean; error?: string }> {
    const { userId } = await auth();
    if (!userId) {
        return { isAdmin: false, error: `User is not authenticated. Cannot ${action}.` };
    }

    const hasAdminRole = await isClerkUserIdAdmin(userId);
    if (!hasAdminRole) {
        return { isAdmin: false, error: `User does not have the admin role. Cannot ${action}.` };
    }

    return { isAdmin: true };
}

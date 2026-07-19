import 'server-only';
import { currentUser } from '@clerk/nextjs/server';

export type AdminAccess = {
    isAdmin: boolean;
    reason?: 'signed-out' | 'missing-role';
    error?: string;
};

export async function requireAdmin(action = 'perform this action'): Promise<AdminAccess> {
    const user = await currentUser();
    if (!user) {
        return { isAdmin: false, reason: 'signed-out', error: `User is not authenticated. Cannot ${action}.` };
    }
    if (user.publicMetadata.role !== 'ADMIN') {
        return { isAdmin: false, reason: 'missing-role', error: `User does not have the admin role. Cannot ${action}.` };
    }

    return { isAdmin: true };
}

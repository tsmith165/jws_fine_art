import 'server-only';
import { currentUser } from '@clerk/nextjs/server';

export async function requireAdmin(action = 'perform this action'): Promise<{ isAdmin: boolean; error?: string }> {
    const user = await currentUser();
    if (!user) {
        return { isAdmin: false, error: `User is not authenticated. Cannot ${action}.` };
    }
    if (user.publicMetadata.role !== 'ADMIN') {
        return { isAdmin: false, error: `User does not have the admin role. Cannot ${action}.` };
    }

    return { isAdmin: true };
}

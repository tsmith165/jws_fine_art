import { useUser } from '@clerk/nextjs';

export function useIsAdmin() {
    const { user } = useUser();

    if (!user) {
        return false;
    }

    for (const membership of user.organizationMemberships) {
        // Match the same logic as middleware: org name is 'ADMIN' and user has admin role
        if (membership.organization.name === 'ADMIN' && (membership.role === 'org:admin' || membership.role === 'admin')) {
            return true;
        }
    }

    return false;
}

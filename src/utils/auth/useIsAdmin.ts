import { useUser } from '@clerk/nextjs';

export function useIsAdmin() {
    const { user } = useUser();

    if (!user) {
        return false;
    }

    for (const role of user.organizationMemberships) {
        //console.log('Checking role:', role);
        if (role.role === 'org:admin') {
            return true;
        }
    }

    return false;
}

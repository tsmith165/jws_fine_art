import type { ReactNode } from 'react';
import { NotAuthorized } from '@/components/auth/NotAuthorized';
import { requireAdmin } from '@/utils/auth/requireAdmin';

export default async function OwnerLayout({ children }: { children: ReactNode }) {
    const access = await requireAdmin('open the studio manager');
    if (!access.isAdmin) return <NotAuthorized signedIn={access.reason === 'missing-role'} />;
    return children;
}

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/utils/auth/requireAdmin';

export default async function OwnerLayout({ children }: { children: ReactNode }) {
    const access = await requireAdmin('open the studio manager');
    if (!access.isAdmin) redirect('/');
    return children;
}

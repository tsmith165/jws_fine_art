import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { NotAuthorized } from '@/components/auth/NotAuthorized';

export const metadata: Metadata = { title: 'Not authorized', robots: { index: false, follow: false } };

export default async function NotAuthorizedPage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
    const [user, params] = await Promise.all([currentUser(), searchParams]);
    return <NotAuthorized signedIn={Boolean(user)} returnTo={params.return_to} />;
}

import { SignIn } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { AccountSessionPanel } from '@/components/auth/AccountSessionPanel';
import { SiteShell } from '@/components/lit-wall/SiteShell';

export const metadata: Metadata = { title: 'Studio sign in', robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect_url?: string }> }) {
    const [user, params] = await Promise.all([currentUser(), searchParams]);
    const returnTo = params.redirect_url?.startsWith('/admin') ? params.redirect_url : '/admin';
    const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress || 'Signed-in account';
    const isAdmin = user?.publicMetadata.role === 'ADMIN';
    return (
        <SiteShell>
            <section className="lw-auth">
                <div className="lw-auth-copy">
                    <span className="lw-eyebrow">Owner access</span>
                    <h1>Studio manager</h1>
                    <p>Sign in to manage artwork, orders, collector inquiries, campaigns, and site health.</p>
                </div>
                {user ? (
                    <AccountSessionPanel email={email} isAdmin={isAdmin} />
                ) : (
                    <SignIn path="/signin" routing="path" fallbackRedirectUrl={returnTo} />
                )}
            </section>
        </SiteShell>
    );
}

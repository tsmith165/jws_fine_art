import { SignOutButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { ArrowLeft, LogOut } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '@/components/lit-wall/SiteShell';

export const metadata: Metadata = { title: 'Studio sign out', robots: { index: false, follow: false } };

export default async function SignOutPage() {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress;
    return (
        <SiteShell>
            <section className="lw-auth lw-auth-denied">
                <div className="lw-auth-copy">
                    <span className="lw-eyebrow">Owner access</span>
                    <h1>{user ? 'Sign out?' : 'You are signed out.'}</h1>
                    <p>{user ? `End the studio manager session for ${email || 'this account'}.` : 'There is no active owner session.'}</p>
                </div>
                <div className="lw-auth-panel">
                    <h2>{user ? 'End this session' : 'Return when you are ready'}</h2>
                    <div className="lw-auth-actions">
                        {user ? (
                            <SignOutButton redirectUrl="/signin?signed_out=1">
                                <button className="lw-button lw-button-brass" type="button">
                                    <LogOut size={16} /> Sign out
                                </button>
                            </SignOutButton>
                        ) : (
                            <Link className="lw-button lw-button-brass" href="/signin">
                                Sign in
                            </Link>
                        )}
                        <Link className="lw-button" href={user ? '/admin' : '/'}>
                            <ArrowLeft size={16} /> {user ? 'Keep working' : 'Back to website'}
                        </Link>
                    </div>
                </div>
            </section>
        </SiteShell>
    );
}

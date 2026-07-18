import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { SiteShell } from '@/components/lit-wall/SiteShell';

export const metadata: Metadata = { title: 'Studio sign in', robots: { index: false, follow: false } };

export default function SignInPage() {
    return (
        <SiteShell>
            <section className="lw-auth">
                <div>
                    <span className="lw-eyebrow">Owner access</span>
                    <h1>Studio manager</h1>
                    <p>Sign in to manage artwork, orders, collector inquiries, campaigns, and site health.</p>
                </div>
                <SignIn path="/signin" routing="path" fallbackRedirectUrl="/admin" />
            </section>
        </SiteShell>
    );
}

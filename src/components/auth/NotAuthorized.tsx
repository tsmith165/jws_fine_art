import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { SiteShell } from '@/components/lit-wall/SiteShell';

export function NotAuthorized({ signedIn = false, returnTo = '/admin' }: { signedIn?: boolean; returnTo?: string }) {
    const safeReturnTo = returnTo.startsWith('/admin') ? returnTo : '/admin';
    return (
        <SiteShell>
            <section className="lw-auth lw-auth-denied">
                <div className="lw-auth-copy">
                    <span className="lw-eyebrow">Owner access</span>
                    <h1>Not authorized.</h1>
                    <p>
                        {signedIn
                            ? 'This account does not have access to the studio manager. Sign in with an authorized owner account or return to the public site.'
                            : 'Sign in with an authorized owner account to open the studio manager.'}
                    </p>
                </div>
                <div className="lw-auth-panel">
                    <h2>{signedIn ? 'Use another account' : 'Owner sign in required'}</h2>
                    <p>{signedIn ? 'You are signed in, but this account is not an administrator.' : 'The requested page is private.'}</p>
                    <div className="lw-auth-actions">
                        <Link className="lw-button lw-button-brass" href={`/signin?redirect_url=${encodeURIComponent(safeReturnTo)}`}>
                            <LogIn size={16} /> {signedIn ? 'Review account' : 'Sign in'}
                        </Link>
                        <Link className="lw-button" href="/">
                            <ArrowLeft size={16} /> Back to website
                        </Link>
                    </div>
                </div>
            </section>
        </SiteShell>
    );
}

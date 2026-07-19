'use client';

import { SignOutButton } from '@clerk/nextjs';
import { LogOut, RefreshCw } from 'lucide-react';

export function AccountSessionPanel({ email, isAdmin }: { email: string; isAdmin: boolean }) {
    return (
        <div className="lw-auth-panel">
            <span className="lw-eyebrow">Current session</span>
            <h2>You are already signed in.</h2>
            <p>
                {email}
                <br />
                {isAdmin ? 'This account has studio manager access.' : 'This account is signed in but is not a studio administrator.'}
            </p>
            <div className="lw-auth-actions">
                {isAdmin ? (
                    <a className="lw-button lw-button-brass" href="/admin">
                        Open studio manager
                    </a>
                ) : null}
                <SignOutButton redirectUrl="/signin?account=switched">
                    <button className="lw-button" type="button">
                        <RefreshCw size={16} /> Switch account
                    </button>
                </SignOutButton>
                <SignOutButton redirectUrl="/signin?signed_out=1">
                    <button className="lw-button" type="button">
                        <LogOut size={16} /> Sign out
                    </button>
                </SignOutButton>
            </div>
        </div>
    );
}

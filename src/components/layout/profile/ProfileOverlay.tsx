'use client';

import { useUser } from '@clerk/nextjs';
import { useClerk } from '@clerk/nextjs';
import { useIsAdmin } from '@/utils/auth/useIsAdmin';
import Image from 'next/image';

export default function ProfileOverlay() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const isAdmin = useIsAdmin();

    if (!user) {
        return null;
    }

    const handleSignOut = () => {
        signOut({ redirectUrl: '/' });
    };

    return (
        <div className="flex w-[280px] flex-col p-5">
            <div className="mb-4 flex flex-row items-center space-x-4">
                {user.imageUrl && (
                    <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-primary_dark"
                    />
                )}
                <div className="flex flex-col space-y-1">
                    <span className="text-base font-bold text-white">
                        {user.fullName || user.username || 'User'}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {isAdmin ? 'Admin' : 'User'}
                    </span>
                </div>
            </div>

            {user.primaryEmailAddress && (
                <div className="mb-4 border-t border-primary pt-3">
                    <span className="text-sm text-stone-300">
                        {user.primaryEmailAddress.emailAddress}
                    </span>
                </div>
            )}

            <button
                onClick={handleSignOut}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-primary_dark"
            >
                Sign Out
            </button>
        </div>
    );
}

'use client';

import React, { memo, useCallback } from 'react';
import { useClerk, useSession } from '@clerk/nextjs';

const MenuOverlaySignOutButton: React.FC = memo(() => {
    const { signOut } = useClerk();
    const { isLoaded, isSignedIn } = useSession();

    const handleSignOut = useCallback(() => {
        signOut();
    }, [signOut]);

    if (!isLoaded || !isSignedIn) {
        return null;
    }

    return (
        <div
            className="relative z-50 flex h-[50px] items-center justify-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_dark last:rounded-bl-md last:border-b-0 hover:bg-secondary_dark hover:text-primary"
            id="sign_out_button"
            onClick={handleSignOut}
        >
            Sign Out
        </div>
    );
});

MenuOverlaySignOutButton.displayName = 'MenuOverlaySignOutButton';

export default MenuOverlaySignOutButton;

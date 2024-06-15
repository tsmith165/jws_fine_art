'use client';

import React from 'react';
import { useClerk } from '@clerk/nextjs';

function MenuOverlaySignOutButton() {
    const { signOut } = useClerk();
    return (
        <div
            className={`relative z-50 flex h-[50px] items-center justify-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_dark last:rounded-bl-md last:border-b-0 hover:bg-secondary_dark hover:text-primary`}
            id={`sign_out_button`}
            onClick={() => signOut()}
        >
            Sign Out
        </div>
    );
}

export default MenuOverlaySignOutButton;

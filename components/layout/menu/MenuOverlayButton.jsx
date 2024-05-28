import React from 'react';
import { useClerk } from '@clerk/clerk-react';
import Link from 'next/link';

function MenuOverlayButton({ menu_name, id, url_endpoint, isActive }) {
    if (menu_name === 'Sign Out') {
        const clerk = useClerk();
        return (
            <div
                className={`flex h-[50px] items-center justify-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_dark last:rounded-bl-md last:border-b-0 hover:bg-secondary_dark hover:text-primary ${isActive ? 'bg-secondary text-primary' : ''}`}
                id={id}
                onClick={() => clerk.signOut()}
            >
                {menu_name}
            </div>
        );
    }

    return (
        <Link
            href={url_endpoint}
            className={`flex h-[50px] items-center justify-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_dark last:rounded-bl-md last:border-b-0 hover:bg-secondary_dark hover:text-primary ${isActive ? 'bg-secondary text-primary' : ''}`}
        >
            {menu_name}
        </Link>
    );
}

export default MenuOverlayButton;

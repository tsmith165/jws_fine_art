import React from 'react';
import { useClerk } from '@clerk/clerk-react';
import { useRouter } from 'next/navigation';

function MenuOverlayButton({ menu_name, id, url_endpoint }) {
    const router = useRouter();
    const clerk = useClerk();

    if (menu_name === 'Sign Out') {
        return (
            <div
                className="flex h-[50px] items-center justify-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_light last:rounded-bl-md last:border-b-0 hover:bg-secondary_light hover:text-primary_dark"
                id={id}
                onClick={() => clerk.signOut()}
            >
                <b className="text-base no-underline">{menu_name}</b>
            </div>
        );
    }

    return (
        <div
            className="flex h-[50px] items-center justify-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_light last:rounded-bl-md last:border-b-0 hover:bg-secondary_light hover:text-primary_dark"
            id={id}
            onClick={(e) => {
                e.preventDefault();
                console.log('Pushing to: ' + url_endpoint);
                router.push(url_endpoint);
            }}
        >
            <b className="text-base no-underline">{menu_name}</b>
        </div>
    );
}

export default MenuOverlayButton;

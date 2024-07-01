import React from 'react';
import Link from 'next/link';

interface MenuOverlayButtonProps {
    menu_name: string;
    id: string;
    url_endpoint: string;
    isActive: boolean;
}

function MenuOverlayButton({ menu_name, id, url_endpoint, isActive }: MenuOverlayButtonProps) {
    return (
        <Link
            href={url_endpoint}
            className={`relative z-50 flex h-[40px] items-center justify-center border-b-2 border-primary_dark bg-primary px-[5px] font-bold text-secondary_dark hover:bg-secondary_dark hover:text-primary ${isActive ? '!bg-secondary_dark !text-primary' : ''}`}
            id={`${id}`}
            aria-label={menu_name}
            prefetch={false}
        >
            {menu_name}
        </Link>
    );
}

export default MenuOverlayButton;

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
            className={`relative z-50 flex h-[48px] items-center border-b border-primary px-4 font-bold uppercase tracking-wide transition-all ${
                isActive
                    ? 'bg-primary text-white'
                    : 'bg-transparent text-stone-300 hover:bg-primary/20 hover:text-primary'
            }`}
            id={`${id}`}
            aria-label={menu_name}
            prefetch={false}
        >
            {menu_name}
        </Link>
    );
}

export default MenuOverlayButton;

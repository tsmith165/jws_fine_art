'use client';

import MenuOverlayButton from './MenuOverlayButton';
import { DEFAULT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST } from '@/lib/menu_list';
import { useIsAdmin } from '@/utils/auth/useIsAdmin';
import { useUser } from '@clerk/nextjs';

import dynamic from 'next/dynamic';
const DynamicMenuOverlaySignOutButton = dynamic(() => import('./MenuOverlaySignOutButton'), { ssr: false });

const ADD_SIGN_IN_OUT_BUTTON = false;

function MenuOverlay({ currentPage }: { currentPage: string }) {
    const { isSignedIn } = useUser();
    const isAdmin = useIsAdmin();

    const menuList = selectMenu(isSignedIn || false, isAdmin);
    const menuItems = generateMenu(menuList, isSignedIn || false, currentPage);

    return <div className="relative z-50 flex w-full flex-col">{menuItems}</div>;
}

function selectMenu(isSignedIn: boolean, isAdmin: boolean) {
    if (!isSignedIn) {
        return DEFAULT_MENU_LIST;
    }
    if (isAdmin) {
        return ADMIN_MENU_LIST;
    }
    return SIGNED_IN_MENU_LIST;
}

function generateMenu(menuList: typeof DEFAULT_MENU_LIST, isSignedIn: boolean, currentPage: string) {
    const menu_items = menuList.map((menuItem) => {
        const [className, menuItemString, , urlEndpoint] = menuItem;
        // More precise matching: exact match for home, startsWith for others
        const isActive = urlEndpoint === '/'
            ? currentPage === '/'
            : currentPage.startsWith(urlEndpoint);

        return (
            <div key={className}>
                <MenuOverlayButton id={className} menu_name={menuItemString} url_endpoint={urlEndpoint} isActive={isActive} />
            </div>
        );
    });

    return menu_items;
}

export default MenuOverlay;

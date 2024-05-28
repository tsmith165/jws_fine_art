import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import MenuOverlayButton from './MenuOverlayButton';
import { SIGNED_OUT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST } from '@/lib/menu_list.js';

const MenuOverlay = ({ currentPage }) => {
    const [menuItems, setMenuItems] = useState([]);
    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        const usingMenu = selectMenu(isLoaded, isSignedIn, user);

        console.log('Menu List (Next Line):');
        console.log(usingMenu);

        const items = generateMenu(usingMenu);
        setMenuItems(items);
    }, [isLoaded, isSignedIn, user]);

    const generateMenu = (menuList) => {
        return menuList.map((menuItem, i) => {
            const [className, menuItemString, , urlEndpoint] = menuItem;
            console.log(`Url endpoint: ${urlEndpoint} | Current page: ${currentPage}`);
            const isActive = urlEndpoint === currentPage;
            return <MenuOverlayButton key={i} id={i} menu_name={menuItemString} url_endpoint={urlEndpoint} isActive={isActive} />;
        });
    };

    const selectMenu = (isLoaded, isSignedIn, user) => {
        if (!isLoaded) {
            console.log('User not loaded - returning signed out menu...');
            return SIGNED_OUT_MENU_LIST;
        }
        if (!isSignedIn || user == null || !user.publicMetadata || !user.publicMetadata.role) {
            console.log('User not signed in or missing metadata - returning signed out menu...');
            return SIGNED_OUT_MENU_LIST;
        }
        if (user.publicMetadata.role === 'ADMIN') {
            console.log('User has role Admin - returning admin menu...');
            return ADMIN_MENU_LIST;
        }
        console.log('User is signed in but not admin - returning signed in non-admin menu...');
        return SIGNED_IN_MENU_LIST;
    };

    return <div className="flex flex-col">{menuItems}</div>;
};

export default MenuOverlay;

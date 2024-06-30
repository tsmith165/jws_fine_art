'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import MenuOverlayButton from './MenuOverlayButton';
import MenuOverlaySignOutButton from './MenuOverlaySignOutButton';
import { DEFAULT_MENU_LIST, SIGNED_IN_MENU_LIST, ADMIN_MENU_LIST } from '@/lib/menu_list';

const ADD_SIGN_IN_OUT_BUTTON = false;

const MenuOverlay = ({ currentPage }: { currentPage: string }) => {
    const [menuItems, setMenuItems] = useState<React.ReactNode[]>([]);
    const { isLoaded, isSignedIn, user } = useUser();

    useEffect(() => {
        const usingMenu = selectMenu(isLoaded, !!isSignedIn, user);

        const items = generateMenu(usingMenu);
        setMenuItems(items);
    }, [isLoaded, isSignedIn, user]);

    const generateMenu = (menuList: typeof DEFAULT_MENU_LIST) => {
        const menu_items = menuList.map((menuItem, i) => {
            const [className, menuItemString, , urlEndpoint] = menuItem;
            let isActive = false;
            if (urlEndpoint === '/') {
                isActive = currentPage === '/';
            } else {
                isActive = currentPage.includes(urlEndpoint);
            }
            return (
                <MenuOverlayButton
                    key={className}
                    id={className}
                    menu_name={menuItemString}
                    url_endpoint={urlEndpoint}
                    isActive={isActive}
                />
            );
        });

        if (isSignedIn && user != null && user.publicMetadata && user.publicMetadata.role) {
            menu_items.push(<MenuOverlaySignOutButton />);
        } else {
            if (ADD_SIGN_IN_OUT_BUTTON) {
                menu_items.push(
                    <MenuOverlayButton
                        key={'sign_in'}
                        id={'sign_in'}
                        menu_name={'Sign In'}
                        url_endpoint={'/signin'}
                        isActive={currentPage.includes('/signin')}
                    />,
                );
            }
        }
        return menu_items;
    };

    const selectMenu = (isLoaded: boolean, isSignedIn: boolean, user: any) => {
        if (!isLoaded) {
            console.log('User not loaded - returning signed out menu...');
            return DEFAULT_MENU_LIST;
        }
        if (!isSignedIn || user == null || !user.publicMetadata || !user.publicMetadata.role) {
            console.log('User not signed in or missing metadata - returning signed out menu...');
            return DEFAULT_MENU_LIST;
        }
        if (user.publicMetadata.role === 'ADMIN') {
            console.log('User has role Admin - returning admin menu...');
            return ADMIN_MENU_LIST;
        }
        console.log('User is signed in but not admin - returning signed in non-admin menu...');
        return SIGNED_IN_MENU_LIST;
    };

    return <div className="relative z-50 flex w-full flex-col">{menuItems}</div>;
};

export default MenuOverlay;

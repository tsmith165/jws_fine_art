'use client'

import { useState } from 'react';
import Link from 'next/link';

import MenuOverlay from './menu/MenuOverlay';
import styles from '@/styles/layout/Navbar.module.scss';
import MenuIcon from '@mui/icons-material/Menu';

import { SignedIn, SignedOut, UserButton, ClerkLoading } from '@clerk/nextjs';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const SiteMenu = () => {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const handleMenuToggle = (e) => {
        e.preventDefault();
        setMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {/* Account Profile Button */}
            <div className={styles.clerk_user_button_container}>
                <SignedIn>
                    <UserButton
                        appearance={{
                            userProfile: { elements: { breadcrumbs: 'bg-slate-500' } },
                        }}
                    />
                </SignedIn>
                <SignedOut>
                    <Link href="/signin">
                        <div className={styles.sign_in_container}>
                            <AccountCircleIcon className={styles.sign_in_button} />
                        </div>
                    </Link>
                </SignedOut>
                <ClerkLoading>
                    <Link href="/signin">
                        <div className={styles.sign_in_container}>
                            <AccountCircleIcon className={styles.sign_in_button} />
                        </div>
                    </Link>
                </ClerkLoading>
            </div>

            {/* Hamburger Button */}
            <div className={styles.page_menu_full_container} onMouseLeave={(e) => {
                e.preventDefault();
                setMenuOpen(false);
            }}>
                <div
                    className={styles.menu_button_container}
                    onClick={handleMenuToggle}
                >
                    <MenuIcon className={isMenuOpen ? styles.hamburger_button_open : styles.hamburger_button} />
                </div>

                {isMenuOpen && (
                    <div className={styles.page_menu_container}>
                        <div className={styles.page_menu_body}>
                            <MenuOverlay />
                        </div>
                    </div>
                )}
            </div>  
        </>
    );
};

export default SiteMenu;




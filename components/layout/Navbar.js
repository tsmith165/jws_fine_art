import logger from "@/lib/logger";

import PROJECT_CONSTANTS from '@/lib/constants';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

import { SignedIn, SignedOut, UserButton, ClerkLoading } from '@clerk/nextjs';

import AppContext from '@/contexts/AppContext';

import MenuOverlay from './menu/MenuOverlay';
import FilterMenu from './FilterMenu';

import styles from '@/styles/layout/Navbar.module.scss';

import MenuIcon from '@mui/icons-material/Menu'; // Menu Hamburger Icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Account Profile Icon

class Navbar extends React.Component {
    static contextType = AppContext;
    
    constructor(props) {
        super(props);
    }

    async componentDidMount() {}

    render() {
        const { appState, setAppState } = this.context;

        if (!appState) {
            console.error('Navbar did not receive app_state');
            return null; // or some fallback JSX
        }
        
        // console.log("Navbar appState:", appState);
        
        logger.debug(appState)
        logger.debug(
            `Rendering Navbar with appState pathname: ${appState.pathname} | Theme: ${appState.theme} | Filter Menu Open: ${appState.filter_menu_open}`,
        );

        return (
            <nav className={styles.navbar}>
                <div className={styles.navbar_container}>
                    <div className={`${styles.navbar_logo} ${styles.centered_image_container}`}>
                        <Link href="/">
                            <Image
                                className={`${styles.navbar_logo_image} ${styles.centered_image}`}
                                src="/jws_logo_small.png"
                                alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                                width={274}
                                height={80}
                                sizes="250px"
                            />
                        </Link>
                    </div>

                    {appState.pathname == '/gallery' ? (
                        <FilterMenu/>
                    ) : null}

                    <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                        <div className={styles.instagram_link_container}>
                            <div className={styles.instagram_logo_link_container}>
                                <Image
                                    className={styles.instagram_logo_link}
                                    src="/instagram_icon_50.png"
                                    alt="Instagram Link"
                                    width={50}
                                    height={50}
                                />
                            </div>
                        </div>
                    </Link>

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

                    <div
                        className={styles.page_menu_full_container}
                        onMouseLeave={(e) => {
                            e.preventDefault();
                            setAppState({ ...appState, menu_open: false });
                        }}
                    >
                        <div
                            className={styles.menu_button_container}
                            onClick={(e) => {
                                e.preventDefault();
                                setAppState({
                                    ...appState,
                                    menu_open: !appState.menu_open,
                                });
                            }}
                        >
                            <MenuIcon className={appState.menu_open ? styles.hamburger_button_open : styles.hamburger_button}/>
                        </div>

                        {appState.menu_open == false ? null : (
                            <div className={styles.page_menu_container}>
                                <div className={styles.page_menu_body}>
                                    <MenuOverlay/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        );
    }
}

Navbar.contextType = AppContext;

export default Navbar;

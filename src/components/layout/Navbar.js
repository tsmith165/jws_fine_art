import logger from "@/lib/logger";

import PROJECT_CONSTANTS from '@/lib/constants';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

import { SignedIn, SignedOut, UserButton, ClerkLoading } from '@clerk/nextjs';

import MenuOverlay from './menu/MenuOverlay';
import FilterMenu from './FilterMenu';

import styles from '@/styles/layout/Navbar.module.scss';

import MenuIcon from '@mui/icons-material/Menu'; // Menu Hamburger Icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Account Profile Icon

class Navbar extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {}

    render() {
        logger.debug(
            `Rendering Navbar with app_state pathname: ${this.props.app_state.pathname} | Theme: ${this.props.app_state.theme} | Filter Menu Open: ${this.props.app_state.filter_menu_open}`,
        );

        return (
            <nav className={styles.navbar}>
                <div className={styles.navbar_container}>
                    <div className={styles.navbar_logo}>
                        <Link href="/">
                            <Image
                                className={styles.navbar_logo_img}
                                src="/jws_logo_small.png"
                                alt={`${PROJECT_CONSTANTS.SITE_FULL_NAME} logo`}
                                width={274}
                                height={80}
                                sizes="250px"
                            />
                        </Link>
                    </div>

                    {this.props.app_state.pathname == '/' ? (
                        <FilterMenu app_state={this.props.app_state} app_set_state={this.props.app_set_state} />
                    ) : null}

                    <Link href="https://www.instagram.com/jws_fineart/" target="_blank" rel="noreferrer">
                        <div className={styles.instagram_link_container}>
                            <div className={styles.instagram_logo_link_container}>
                                <Image
                                    className={styles.instagram_logo_link}
                                    src="/instagram_icon_50.png"
                                    alt="Instagram Link"
                                    width={40}
                                    height={40}
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
                            this.props.app_set_state({ ...this.props.app_state, menu_open: false });
                        }}
                    >
                        <div
                            className={styles.menu_button_container}
                            onClick={(e) => {
                                e.preventDefault();
                                this.props.app_set_state({
                                    ...this.props.app_state,
                                    menu_open: !this.props.app_state.menu_open,
                                });
                            }}
                        >
                            <MenuIcon
                                className={
                                    this.props.app_state.menu_open
                                        ? styles.hamburger_button_open
                                        : styles.hamburger_button
                                }
                            />
                        </div>

                        {this.props.app_state.menu_open == false ? null : (
                            <div className={styles.page_menu_container}>
                                <div className={styles.page_menu_body}>
                                    <MenuOverlay
                                        most_recent_page_id={this.props.most_recent_page_id}
                                        app_state={this.props.app_state}
                                        app_set_state={this.props.app_set_state}
                                        isLoaded={this.props.isLoaded}
                                        isSignedIn={this.props.isSignedIn}
                                        user={this.props.user}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        );
    }
}

export default Navbar;

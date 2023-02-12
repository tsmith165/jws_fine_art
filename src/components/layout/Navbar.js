import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react';

import MenuOverlay from './MenuOverlay'
import ProfileOverlay from './ProfileOverlay'

import styles from "../../../styles/layout/Navbar.module.scss"

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const Navbar = ({most_recent_page_id}) => {
    const use_account_icon_as_link = true;

    const [menu_open, set_menu_open] = useState(false)

    function menu_clicked(event) {
        event.preventDefault()
        console.log(`Setting Menu To: ${menu_open ? false : true}`)
        set_menu_open(menu_open ? false : true)
    }

    function menu_hovered(event, mouse_in) {
        event.preventDefault()
        console.log(`Setting Menu To: ${mouse_in}`)
        set_menu_open(mouse_in)
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <Link href="/" styles={{}}>
                    <div className={styles.navbar_logo}>
                        <Image className={styles.navbar_logo_img} src='/jws_logo_small.png' alt='JWS Fine Art Logo' layout="fill" objectFit='contain' priority={true}/>
                    </div>
                </Link>

                <Link href="https://www.instagram.com/jws_fineart/">
                    <div className={styles.instagram_link_container}>
                        <div className={styles.instagram_logo_link_container}>
                            <Image className={styles.instagram_logo_link} src='/instagram_icon_50.png' alt='Instagram Link' layout="fill" objectFit='contain' priority={true}/>
                        </div>
                    </div>
                </Link>

                
                <div className={styles.clerk_user_button_container}>
                    <SignedIn>
                    <UserButton
                        appearance={{
                        userProfile: { elements: { breadcrumbs: "bg-slate-500" } },
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
                </div>
                

                                
                <div className={styles.page_menu_full_container} onMouseOver={ (e) => { menu_hovered(e, true) }} onMouseLeave={ (e) => { menu_hovered(e, false) }}>
                    <div className={styles.menu_button_container} >
                        <MenuRoundedIcon className={styles.hamburger_button} />
                    </div>
                    
                    {
                        menu_open == true ? (
                            <div className={styles.page_menu_container}>
                                <div className={styles.page_menu_body}>
                                    <MenuOverlay set_menu_open={set_menu_open} most_recent_page_id={most_recent_page_id}/>
                                </div>
                            </div>
                        ) : (
                            null
                        )
                    }

                </div>
            </div>
        </nav>
    )
}

export default Navbar;
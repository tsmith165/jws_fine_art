import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react';

import MenuOverlay from './menu/MenuOverlay'
// import ProfileOverlay from './menu/ProfileOverlay'

import styles from "../../../styles/layout/Navbar.module.scss"

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { SignedIn, SignedOut, SignInButton, UserButton, ClerkLoading } from "@clerk/nextjs";

import { Tooltip } from 'react-tooltip'

import Tune from '@material-ui/icons/Tune';     // Filter Menu Toggle Button
import AcUnit from '@material-ui/icons/AcUnit'; // Snow
import Waves from '@material-ui/icons/Waves';   // Ocean
import Landscape from '@material-ui/icons/Landscape'; // Mountains
import LocationCity from '@material-ui/icons/LocationCity'; // City
import LocalFlorist from '@material-ui/icons/LocalFlorist'; // Flowers
import Portrait from '@material-ui/icons/Portrait'; // Portrait
import Exposure from '@material-ui/icons/Exposure'; // Black And White
import Block from '@material-ui/icons/Block'; // None
import FilterBAndW from '@material-ui/icons/FilterBAndW'; // Abstract
import ShoppingCart from '@material-ui/icons/ShoppingCart'; // Abstract


const theme_filters = [
    ['Water', <Waves className={styles.gallery_filter_icon} />], 
    ['Snow', <AcUnit className={styles.gallery_filter_icon} />], 
    ['Mountain', <Landscape className={styles.gallery_filter_icon} />], 
    ['Landscape', <LocalFlorist className={styles.gallery_filter_icon} />], 
    ['City', <LocationCity className={styles.gallery_filter_icon} />],
    ['Portrait', <Portrait className={styles.gallery_filter_icon} />],
    ['Black and White', <Exposure className={styles.gallery_filter_icon} />],
    ['Abstract', <FilterBAndW className={styles.gallery_filter_icon} />],
    ['Available', <ShoppingCart className={styles.gallery_filter_icon} />],
    ['None', <Block className={styles.gallery_filter_icon} />]
]

const Navbar = ({most_recent_page_id, app_state, app_set_state, isLoaded, isSignedIn, user }) => {

    const [menu_open, set_menu_open] = useState(false)

    console.log(`Rendering Navbar with app_state URL Path: ${app_state.url_path} | Theme: ${app_state.theme} | Filter Menu Open: ${app_state.filter_menu_open}`)

    var filter_menu_array = [];
    for (var i = 0; i < theme_filters.length; i++) {
        let filter = theme_filters[i][0];
        let icon = theme_filters[i][1];
        filter_menu_array.push((
            <div className={(filter == app_state.theme) ? `${styles.gallery_filter_icon_container_selected} ${styles.gallery_filter_icon_container}` : styles.gallery_filter_icon_container} 
                id={filter}
                data-tooltip-content={`${filter}`}
                onClick={(e) => { e.preventDefault(); app_set_state({theme: filter, url_path: app_state.url_path, filter_menu_open: true}) }}
            >
                {icon}
                <Tooltip anchorId={filter} />
            </div>
        ))
    }

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <Link href="/" styles={{}}>
                    <div className={styles.navbar_logo}>
                        <Image className={styles.navbar_logo_img} src='/jws_logo_small.png' alt='JWS Fine Art Logo' layout="fill" objectFit='contain' sizes="250px"/>
                    </div>
                </Link>

                { (app_state.url_path == '/') ? (
                    <div className={(app_state.filter_menu_open == false) ? styles.gallery_filter_menu_toggle : `${styles.gallery_filter_menu_toggle} ${styles.gallery_filter_menu_toggle_open}` }>
                        {(app_state.filter_menu_open == false) ? (
                            <div className={styles.gallery_filter_menu_tooltip} onClick={(e) => { e.preventDefault(); app_set_state({filter_menu_open: !app_state.filter_menu_open, theme: app_state.theme, url_path: app_state.url_path}) }}>
                                Filters
                            </div>
                        ) : ( null ) }
                        <Tune className={styles.gallery_filter_menu_toggle_icon} onClick={(e) => { e.preventDefault(); app_set_state({filter_menu_open: !app_state.filter_menu_open, theme: app_state.theme, url_path: app_state.url_path}) }}/>
                    </div>
                ) : ( null ) }

                {(app_state.url_path == '/' && app_state.filter_menu_open == true) ? (
                    <div className={styles.gallery_filter_menu} >
                        { filter_menu_array }
                    </div>
                ) : ( null ) }

                <Link href="https://www.instagram.com/jws_fineart/">
                    <div className={styles.instagram_link_container}>
                        <div className={styles.instagram_logo_link_container}>
                            <Image className={styles.instagram_logo_link} src='/instagram_icon_50.png' alt='Instagram Link' layout="fill" objectFit='contain'/>
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
                    <ClerkLoading>
                        <Link href="/signin">
                            <div className={styles.sign_in_container}>
                                <AccountCircleIcon className={styles.sign_in_button} />
                            </div>
                        </Link>
                    </ClerkLoading>
                </div>
                

                                
                <div className={styles.page_menu_full_container} onMouseLeave={ (e) => { e.preventDefault(); set_menu_open(false) }}>
                    <div className={styles.menu_button_container} onClick={ (e) => { e.preventDefault(); set_menu_open(!menu_open) }}>
                        <MenuRoundedIcon className={(menu_open) ? styles.hamburger_button_open : styles.hamburger_button} />
                    </div>
                    
                    {
                        menu_open == true ? (
                            <div className={styles.page_menu_container}>
                                <div className={styles.page_menu_body}>
                                    <MenuOverlay 
                                        set_menu_open={set_menu_open} 
                                        most_recent_page_id={most_recent_page_id} 
                                        app_state={app_state} 
                                        app_set_state={app_set_state} 
                                        isLoaded={isLoaded} 
                                        isSignedIn={isSignedIn} 
                                        user={user}
                                    />
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
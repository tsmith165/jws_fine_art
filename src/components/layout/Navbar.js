import React from 'react';
import Image from 'next/image'
import Link from 'next/link'

import { SignedIn, SignedOut, SignInButton, UserButton, ClerkLoading } from "@clerk/nextjs";
import { Tooltip } from 'react-tooltip'

import MenuOverlay from './menu/MenuOverlay'

import styles from "../../../styles/layout/Navbar.module.scss"

// Menu Hamburger Icon
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

// Account Profile Icon
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

// Filter Menu Icons
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

const THEME_FILTERS = [
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

class Navbar extends React.Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {

    }

    render() {
        var filter_menu_array = [];
        for (var i = 0; i < THEME_FILTERS.length; i++) {
            let filter = THEME_FILTERS[i][0];
            let icon = THEME_FILTERS[i][1];
            filter_menu_array.push((
                <div key={i} className={(filter == this.props.app_state.theme) ? `${styles.gallery_filter_icon_container_selected} ${styles.gallery_filter_icon_container}` : styles.gallery_filter_icon_container} 
                    id={filter}
                    data-tooltip-content={`${filter}`}
                    onClick={(e) => { e.preventDefault(); console.log(`Upating theme to: ${filter}`); this.props.app_set_state({...this.props.app_state, theme: filter}) }}
                >
                    {icon}
                    <Tooltip anchorId={filter} />
                </div>
            ))
        }

        console.log(`Rendering Navbar with app state (Next Line):`)
        console.log(this.props.app_state)

        return (
            <nav className={styles.navbar}>
                <div className={styles.navbar_container}>
                    <div className={styles.navbar_logo}>
                        <Link href="/">
                            <Image className={styles.navbar_logo_img} src='/jws_logo_small.png' alt='JWS Fine Art Logo' priority={true} fill style={{objectFit:"contain"}} sizes="250px"/>
                        </Link>
                    </div>

                    { ( this.props.app_state.pathname === '/') ? (
                        <div className={(this.props.app_state.filter_menu_open == false) ? styles.gallery_filter_menu_toggle : `${styles.gallery_filter_menu_toggle} ${styles.gallery_filter_menu_toggle_open}` }>
                            {(this.props.app_state.filter_menu_open == false) ? (
                                <div className={styles.gallery_filter_menu_tooltip} onClick={(e) => { e.preventDefault(); this.props.app_set_state({...this.props.app_state, filter_menu_open: !this.props.app_state.filter_menu_open}) }}>
                                    Filters
                                </div>
                            ) : ( null ) }
                            <Tune className={styles.gallery_filter_menu_toggle_icon} onClick={(e) => { e.preventDefault(); this.props.app_set_state({...this.props.app_state, filter_menu_open: !this.props.app_state.filter_menu_open}) }}/>
                        </div>
                    ) : ( null ) }

                    { ( this.props.app_state.pathname === '/' && this.props.app_state.filter_menu_open == true) ? (
                        <div className={styles.gallery_filter_menu} >
                            { filter_menu_array }
                        </div>
                    ) : ( null ) }

                    <Link href="https://www.instagram.com/jws_fineart/">
                        <div className={styles.instagram_link_container}>
                            <div className={styles.instagram_logo_link_container}>
                                <Image className={styles.instagram_logo_link} src='/instagram_icon_50.png' alt='Instagram Link' fill style={{objectFit:"contain"}}/>
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

                    <div className={styles.page_menu_full_container} onMouseLeave={ (e) => { e.preventDefault(); this.props.app_set_state({...this.props.app_state, menu_open: false}) }}>
                        <div className={styles.menu_button_container} onClick={ (e) => { e.preventDefault(); this.props.app_set_state({...this.props.app_state, menu_open: !this.props.app_state.menu_open}) }}>
                            <MenuRoundedIcon className={(this.props.app_state.menu_open) ? styles.hamburger_button_open : styles.hamburger_button} />
                        </div>
                        
                        {
                            this.props.app_state.menu_open == true ? (
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
                            ) : (
                                null
                            )
                        }

                    </div>
                </div>
            </nav>
        )
    }
}

export default Navbar;
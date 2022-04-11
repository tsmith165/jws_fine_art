import Link from 'next/link'
import Image from 'next/image'
import React, { useState } from 'react';

import Menu from './Menu'
import Profile from './Profile'

import styles from "../../../styles/Navbar.module.scss"

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const Navbar = ({}) => {
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
                <Link href="/" passHref={true} styles={{}}>
                    <div className={styles.navbar_logo}>
                        <Image className={styles.navbar_logo_img} src='/jws_logo.png' alt='JWS Fine Art Logo' layout="fill" width={1920} height={561}/>
                    </div>
                </Link>

                <Link href="https://www.instagram.com/jws_fineart/" passHref={true}>
                    <div className={styles.instagram_link_container}>
                        <Image className={styles.instagram_link_image} src='/instagram.png' alt='Instagram Link' layout="fill" width={50} height={50}/>
                    </div>
                </Link>

                <div className={styles.account_menu_full_container}>
                    {/*
                    { use_account_icon_as_link === true ? (
                            <Link href="/signin" passHref={true}>
                                <div className={styles.menu_button_container}>
                                    <AccountCircleIcon className={styles.account_button} />
                                </div>
                            </Link>
                        ) : (
                            <div className={styles.menu_button_container}>
                                <AccountCircleIcon className={styles.account_button} />
                            </div>
                        )
                    }
                    */}
                    <div className={styles.menu_button_container}>
                        <AccountCircleIcon className={styles.account_button} />
                    </div>

                    <div className={styles.account_menu_container}>
                        <div className={styles.account_menu_body}>
                            <Profile />
                        </div>
                    </div>
                </div>
                
                <div className={styles.page_menu_full_container} onMouseOver={ (e) => { menu_hovered(e, true) }} onMouseLeave={ (e) => { menu_hovered(e, false) }}>
                    <div className={styles.menu_button_container} >
                        <MenuRoundedIcon className={styles.hamburger_button} />
                    </div>
                    
                    {
                        menu_open == true ? (
                            <div className={styles.page_menu_container}>
                                <div className={styles.page_menu_body}>
                                    <Menu set_menu_open={set_menu_open}/>
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
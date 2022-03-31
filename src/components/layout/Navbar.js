import Link from 'next/link'
import Image from 'next/image'
import Menu from './Menu'
import Profile from './Profile'
import styles from "../../../styles/Navbar.module.scss"

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const Navbar = ({}) => {
    const use_account_icon_as_link = true;

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <Link href="/" passHref={true} styles={{}}>
                    <div className={styles.navbar_logo}>
                        <Image className={styles.navbar_logo_img} src='/jws_logo.png' alt='JWS Fine Art Logo' layout="fill" width={1920} height={561}/>
                    </div>
                </Link>


                <div className={styles.account_menu_full_container}>
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

                    <div className={styles.account_menu_container}>
                        <div className={styles.account_menu_body}>
                            <Profile />
                        </div>
                    </div>
                </div>
                
                <div className={styles.page_menu_full_container}>
                    <div className={styles.menu_button_container}>
                        <MenuRoundedIcon className={styles.hamburger_button} />
                    </div>

                    <div className={styles.page_menu_container}>
                        <div className={styles.page_menu_body}>
                            <Menu />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
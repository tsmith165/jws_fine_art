import Link from 'next/link'
import Image from 'next/image'
import styles from "../../../styles/Navbar.module.scss"

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

const Navbar = ({}) => {
    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.navbar_container}>
                    <Link href="/" passHref={true} styles={{}}>
                        <div className={styles.navbar_logo}>
                            <Image className={styles.navbar_logo_img} src='/jws_logo.png' alt='JWS Fine Art Logo' layout="fill" width={1920} height={561}/>
                        </div>
                    </Link>

                    <Link href="/menu" passHref={true}>
                        <div className={styles.menu_button_container}>
                            <MenuRoundedIcon className={styles.hamburger_button} />
                        </div>
                    </Link>
                
                </div>
            </nav>
        </>
    )
}

export default Navbar;
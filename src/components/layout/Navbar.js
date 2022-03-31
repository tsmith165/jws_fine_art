import Link from 'next/link'
import Image from 'next/image'
import styles from "../../../styles/Navbar.module.scss"

import { signIn, signOut } from 'next-auth/react';
import { useSession } from '../../../lib/next-auth-react-query';

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

function generate_good_session(session) {
    var account_menu_jsx = (
        <div className={styles.account_menu}>
            <div className={styles.account_menu_header}>
                <div className={styles.account_name}>
                    {session.token?.email}
                </div>
                <button type="button" className={styles.account_auth_button} onClick={() => signOut()}>
                    Sign out
                </button>
            </div>
            <div className={styles.account_menu_body}>
                <div className={styles.role_container}>
                    {
                        session.token?.role ? 
                        <b>Role: {session.token?.role}</b> :
                        <b>Role: Default</b>
                    }
                    
                </div>
            </div>
        </div>
    );
    return account_menu_jsx
}

function generate_bad_session() {
    var account_menu_jsx = (
        <div className={styles.account_menu}>
            <div className={styles.account_menu_header}>
                <div className={styles.account_name}>
                    Not signed in <br />
                </div>
                <Link href={'/signin'} passHref={true}> 
                <button type="button" className={styles.account_auth_button}>
                    Sign in
                </button>
                </Link>
            </div>
            <div className={styles.account_menu_body}>

            </div>
        </div>
    );
    return account_menu_jsx
}

const Navbar = ({}) => {
    const [session, loading] = useSession({
        required: false,
        queryConfig: {
          staleTime: 60 * 1000 * 60 * 3, // 3 hours
          refetchInterval: 60 * 1000 * 5, // 5 minutes
        },
    });

    var account_menu_jsx = null;
    if (loading) {
        console.log("Generating bad session menu...")
        account_menu_jsx = generate_bad_session();

        console.log(account_menu_jsx)
    } else {
        if (session) {
            console.log("Generating good session menu...")
            account_menu_jsx = generate_good_session(session)
        } else {
            console.log("Generating bad session menu...")
            account_menu_jsx = generate_bad_session()
        }
    }

    const use_account_icon_as_link = true;

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_container}>
                <Link href="/" passHref={true} styles={{}}>
                    <div className={styles.navbar_logo}>
                        <Image className={styles.navbar_logo_img} src='/jws_logo.png' alt='JWS Fine Art Logo' layout="fill" width={1920} height={561}/>
                    </div>
                </Link>


                <div className={styles.account_container}>
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
                            {account_menu_jsx}
                        </div>
                    </div>
                </div>

                <Link href="/menu" passHref={true}>
                    <div className={styles.menu_button_container}>
                        <MenuRoundedIcon className={styles.hamburger_button} />
                    </div>
                </Link>
            
            </div>
        </nav>
    )
}

export default Navbar;
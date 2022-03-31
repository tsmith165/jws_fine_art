import Link from 'next/link'
import styles from "../../../styles/Navbar.module.scss"

import { signIn, signOut } from 'next-auth/react';

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

const Profile = ({ session }) => {
    var account_menu_jsx = null;
    if (session == null) {
        account_menu_jsx = generate_bad_session();
    } else {
        //console.log(`User Role: ${session.token?.role}`)
        //if ( session.token?.role && session.token?.role == 'ADMIN' ) {
        account_menu_jsx = generate_good_session(session);
    }

    return ( account_menu_jsx )
}

export default Profile;

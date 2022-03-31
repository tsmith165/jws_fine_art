import Link from 'next/link'

import { useSession } from '../../../lib/next-auth-react-query';
import { signIn, signOut } from 'next-auth/react';

import styles from "../../../styles/Navbar.module.scss"

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

const Profile = ({ }) => {
    const [session, loading] = useSession({
        required: false,
        queryConfig: {
          staleTime: 60 * 1000 * 60 * 3, // 3 hours
          refetchInterval: 60 * 1000 * 5, // 5 minutes
        },
    });

    console.log("Creating Profile Overlay...")

    console.log("Profile Session (Next Line):");
    console.log(session)

    var account_menu_jsx = null;
    if (session) {
        account_menu_jsx = generate_good_session(session);
    } else {
        //console.log(`User Role: ${session.token?.role}`)
        //if ( session.token?.role && session.token?.role == 'ADMIN' ) {
        account_menu_jsx = generate_bad_session();
    }

    return ( account_menu_jsx )
}

export default Profile;

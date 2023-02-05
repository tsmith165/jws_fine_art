import Link from 'next/link'
import React, { useState } from 'react';

import styles from "../../../styles/layout/ProfileOverlay.module.scss"

import { CircularProgress } from '@material-ui/core';

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
            <div className={styles.profile_menu_body}>
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

function generate_bad_session(handleSubmit, loading, sent) {
    var account_menu_jsx = (
        <div className={styles.account_menu}>
            <div className={styles.account_menu_header}>
                <div className={styles.account_name}>
                    Sign In With Email:
                </div>
            </div>
            <div className={styles.account_menu_body}>
                <div className={styles.email_form_container}>
                    <form method="post" onSubmit={handleSubmit} className={styles.sign_in_form} /*action="/api/auth/signin/email"*/>
                        <div className={styles.email_input_container}>
                            <input type="text" id="email" name="email" className={styles.email_input} autoComplete={"on"}/>
                        </div>
                        
                        <div className={styles.submit_container}>
                            <button type="submit" className={styles.sign_in_button}>Sign In</button>
                            <div className={styles.loader_container}>
                                {loading == false ? ( 
                                    sent == false ? ( 
                                        null
                                    ) : (
                                        <div className={styles.sent_label}>Login E-Mail Sent. Check your E-Mail...</div>
                                    )
                                ) : (
                                        <CircularProgress color="inherit" className={styles.loader}/>
                                    ) 
                                }
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
    return account_menu_jsx
}

const ProfileOverlay = ({ }) => {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()

        setLoading(true)
        setSent(false)

        const email = event.target.elements.email.value;
        console.log(`Email: ${email}`)
        
        if (email) {
            console.log("Attempting to Sign In...")
            const response = await signIn("email", { email, redirect: false, callbackUrl: process.env.NEXTAUTH_URL })

            console.log("Sign In Response (Next Line):")
            console.log(response)

            if (response.error == null) { setSent(true) }
        }
        setLoading(false)
    }

    console.log("Creating Profile Overlay...")
    
    console.log(`Profile Session Status: ${status} | Session Data (Next Line):`);
    console.log(session)

    var account_menu_jsx = null;
    if (status === "authenticated") {
        account_menu_jsx = generate_good_session(session);
    } else {
        //console.log(`User Role: ${session.token?.role}`)
        //if ( session.token?.role && session.token?.role == 'ADMIN' ) {
        account_menu_jsx = generate_bad_session(handleSubmit, loading, sent);
    }

    return ( account_menu_jsx )
}

export default ProfileOverlay;

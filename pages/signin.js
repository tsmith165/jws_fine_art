import React, {useState, useEffect } from 'react';
import { signIn } from "next-auth/react";
import { useSession } from '../lib/next-auth-react-query';

import Router from 'next/router'

import PageLayout from '../src/components/layout/PageLayout'
import styles from '../styles/SignIn.module.scss'

import { CircularProgress } from '@material-ui/core';

export default function SignIn({  }) {

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

    const [session, loading_session] = useSession({
        required: false,
        queryConfig: {
          staleTime: 60 * 1000 * 60 * 3, // 3 hours
          refetchInterval: 60 * 1000 * 5, // 5 minutes
        },
    });

    if (session) {
        Router.push('/')
    }

    return (
        <PageLayout>
            <div className={styles.full_sign_in_container}>
                <div className={styles.sign_in_container}>
                    <div className={styles.sign_in_header}>
                        <div className={styles.sign_in_header_title}>Sign In</div>
                        
                    </div>
                    <div className={styles.sign_in_body}>
                        <div className={styles.email_form_container}>
                            <form method="post" onSubmit={handleSubmit} /*action="/api/auth/signin/email"*/>
                                
                                <div className={styles.email_input_container}>
                                    <label className={styles.email_label} htmlFor="email">{'Email Adress:'}</label>
                                    <input type="text" id="email" name="email" className={styles.email_input}/>
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
            </div>
        </PageLayout>
    )
}

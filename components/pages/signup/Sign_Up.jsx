'use client'

import styles from "@/styles/forms/SignIn.module.scss"
import { SignUp } from "@clerk/nextjs";

const Sign_Up = () => {
    return (
        <div className={styles.sign_in_container}>
            <div className={styles.sign_in_inner_container}>
                <SignUp path="/signup" routing="path" signUpUrl="/signup" />
            </div>
        </div>
    );
}

export default Sign_Up;

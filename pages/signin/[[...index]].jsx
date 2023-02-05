import { SignIn } from "@clerk/nextjs";

import styles from "../../styles/forms/SignIn.module.scss"

const SignInPage = () => (
    <div className={styles.sign_in_container}>
        <div className={styles.sign_in_inner_container}>
            <SignIn path="/signin" routing="path" signUpUrl="/signup" />
        </div>
    </div>
);

export default SignInPage;
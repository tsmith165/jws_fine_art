import { SignUp } from "@clerk/nextjs";

import styles from "../../styles/forms/SignIn.module.scss"

const SignUpPage = () => (
    <div className={styles.sign_in_container}>
        <div className={styles.sign_in_inner_container}>
            <SignUp/>
        </div>
    </div>
);

export default SignUpPage;
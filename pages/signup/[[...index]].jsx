import { SignUp  } from "@clerk/nextjs";

import styles from "../../styles/forms/SignUp.module.scss"

const SignUpPage = () => (
    <div className={styles.sign_up_container}>
        <div className={styles.sign_up_inner_container}>
            <SignUp/>
        </div>
    </div>
);

export default SignUpPage;
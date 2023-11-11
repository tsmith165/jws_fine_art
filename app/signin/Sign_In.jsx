import styles from "@/styles/forms/SignIn.module.scss"
import { SignIn } from "@clerk/nextjs";

const Sign_In = () => {
    return (
        <div className={styles.sign_in_container}>
            <div className={styles.sign_in_inner_container}>
                <SignIn path="/signin" routing="path" signUpUrl="/signup" />
            </div>
        </div>
    );
}

export default Sign_In;
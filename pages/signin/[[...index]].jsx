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

export const getServerSideProps = async (context) => {
    console.log("Getting Server Side Props")
    const piece = await prisma.piece.findFirst({
      orderBy: {
          o_id: 'desc',
      },
    })
  
    return { 
      props: {
        "most_recent_id": piece['id']
      }
    }
}
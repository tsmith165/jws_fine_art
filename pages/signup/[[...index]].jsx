import { SignUp } from "@clerk/nextjs";

import { prisma } from '../../lib/prisma'

import styles from "../../styles/forms/SignIn.module.scss"

const SignUpPage = () => (
    <div className={styles.sign_in_container}>
        <div className={styles.sign_in_inner_container}>
            <SignUp/>
        </div>
    </div>
);

export default SignUpPage;

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
import React from "react";

import { prisma } from '../../lib/prisma'

import styles from "../../styles/forms/SignIn.module.scss"

import PageLayout from '../../src/components/layout/PageLayout'

import { SignIn } from "@clerk/nextjs";

class SignInPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Sign In"
    }

    async componentDidMount() { }

    render() {
        return (
            <PageLayout page_title={this.page_title}>
                <div className={styles.sign_in_container}>
                    <div className={styles.sign_in_inner_container}>
                        <SignIn path="/signin" routing="path" signUpUrl="/signup" />
                    </div>
                </div>
            </PageLayout>
        )
    }
}

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
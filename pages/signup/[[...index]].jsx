import React from "react";

import { prisma } from '@/lib/prisma'

import styles from "@/styles/forms/SignIn.module.scss"

import PageLayout from '@/components/layout/PageLayout'

import { SignUp } from "@clerk/nextjs";

class SignUpPage extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Sign Up"
    }

    async componentDidMount() { }

    render() {
        return (
            <PageLayout page_title={this.page_title}>
                <div className={styles.sign_in_container}>
                    <div className={styles.sign_in_inner_container}>
                        <SignUp/>
                    </div>
                </div>
            </PageLayout>
        )
    }
}

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
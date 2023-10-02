'use client'

import logger from "@/lib/logger";
import React from "react";

import { prisma } from '@/lib/prisma'

import styles from "@/styles/forms/SignIn.module.scss"

import { SignUp } from "@clerk/nextjs";

class Sign_Up extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = "Sign Up"
    }

    async componentDidMount() { }

    render() {
        return (
            <div className={styles.sign_in_container}>
                <div className={styles.sign_in_inner_container}>
                    <SignUp />
                </div>
            </div>
        )
    }
}

export default Sign_Up;

export const getServerSideProps = async (context) => {
    logger.debug("Getting Server Side Props")
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
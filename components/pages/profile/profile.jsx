'use client'

import React, { useEffect } from 'react';

import PageLayout from '@/components/layout/PageLayout';
import { UserProfile } from "@clerk/nextjs";
import styles from '@/styles/components/Clerk.module.scss';

const Profile = () => {
    const page_title = "User Profile";

    useEffect(() => {

    }, []);

    return (
        <PageLayout page_title={page_title}>
            <div className={styles.clerk_container}>
                <div className={styles.clerk_inner_container}>
                    <UserProfile path="/profile" routing="path" />
                </div>
            </div>
        </PageLayout>
    );
}

export default Profile;

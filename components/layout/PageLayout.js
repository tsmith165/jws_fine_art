'use client'

import styles from "../../styles/layout/PageLayout.module.scss"

import React from 'react';

import Navbar from './Navbar';

import { useAppContext } from '@/contexts/AppContext';

const PageLayout = ({children}) => {
    const { appState } = useAppContext();

    if (!appState) {
        console.error('PageLayout did not receive appState from context');
        return null; // or some fallback JSX
    }

    // console.log("PageLayout appState:", appState);

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <Navbar />
                {children}
            </main>
        </div>
    )
}

export default PageLayout;

import ScriptLoader from '@/components/wrappers/ScriptLoader';

import styles from "../../styles/layout/PageLayout.module.scss"

import React from 'react';

import Navbar from './Navbar';

const PageLayout = ({children}) => {
    return (
        <>
            <ScriptLoader />
            <body>
                <div className={styles.container}>
                    <main className={styles.main}>
                        <Navbar />
                        {children}
                    </main>
                </div>
            </body>
        </>

    )
}

export default PageLayout;

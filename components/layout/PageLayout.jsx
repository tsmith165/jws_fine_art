import ScriptLoader from '@/components/wrappers/ScriptLoader';

import styles from "../../styles/layout/PageLayout.module.scss"

import React from 'react';

import Navbar from './Navbar';

const PageLayout = ({navbar_modifiers, children}) => {
    return (
        <body>
            <ScriptLoader />
            <Navbar />
            {navbar_modifiers}
            <main claaName='relative h-[calc(100vh-100px)] w-full'>
                {children}
            </main>
        </body>

    )
}

export default PageLayout;

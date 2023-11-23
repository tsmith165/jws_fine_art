import AnalyticsLoader from '@/components/wrappers/AnalyticsLoader';
import React from 'react';
import Navbar from './Navbar';

const PageLayout = ({ navbar_modifiers, children }) => {
    return (
        <body>
            <AnalyticsLoader />
            <Navbar />
            {navbar_modifiers}
            <main className="relative h-[calc(100vh-100px)] w-full">{children}</main>
        </body>
    );
};

export default PageLayout;

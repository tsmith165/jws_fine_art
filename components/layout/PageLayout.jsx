import React from 'react';
import Navbar from './Navbar';

const PageLayout = ({ children }) => {
    return (
        <body>
            <Navbar />
            {navbar_modifiers}
            <main className="relative h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] w-full">{children}</main>
        </body>
    );
};

export default PageLayout;

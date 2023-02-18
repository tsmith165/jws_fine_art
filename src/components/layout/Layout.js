import Navbar from './Navbar'
// import Navbar from './NavbarClass'

import React from 'react';
import { useUser } from "@clerk/clerk-react";

const Layout = ( {children, most_recent_page_id, app_state, app_set_state} ) => {
    const { isLoaded, isSignedIn, user } = useUser();

    return (
        <>
            <Navbar 
                most_recent_page_id={most_recent_page_id} 
                app_state={app_state} 
                app_set_state={app_set_state} 
                isLoaded={isLoaded} 
                isSignedIn={isSignedIn} 
                user={user}
            />
            {React.cloneElement(children, {isLoaded: isLoaded, isSignedIn: isSignedIn, user: user})}
        </>
    )
}

export default Layout;
import Navbar from './Navbar'

import React from 'react';
import { useUser } from "@clerk/clerk-react";

const Layout = (props) => {
    const { isLoaded, isSignedIn, user } = useUser();

    console.log(`Loading Layout with most recent page: ${props.most_recent_page_id}`)
    return (
        <>
            <Navbar 
                most_recent_page_id={props.most_recent_page_id} 
                app_state={props.app_state} 
                app_set_state={props.app_set_state} 
                isLoaded={isLoaded} 
                isSignedIn={isSignedIn} 
                user={user}
            />
            {React.cloneElement(props.children, {isLoaded: isLoaded, isSignedIn: isSignedIn, user: user})}
        </>
    )
}

export default Layout;
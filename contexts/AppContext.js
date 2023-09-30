'use client'

import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [appState, setAppState] = useState({
        pathname: '',
        menu_open: false,
        filter_menu_open: false,
        theme: 'None',
    });

    return (
        <AppContext.Provider value={{ appState, setAppState }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => {
    return useContext(AppContext);
}

export default AppContext;
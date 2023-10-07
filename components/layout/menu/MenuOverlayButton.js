import React, { useContext } from 'react';
import styles from '@/styles/layout/MenuOverlay.module.scss';
import { withClerk } from "@clerk/clerk-react";
import { useRouter } from 'next/navigation';
import AppContext from '@/contexts/AppContext';

function MenuOverlayButton({ menu_name, id, app_state, url_endpoint, clerk }) {
    const { appState, setAppState } = useContext(AppContext);
    const router = useRouter();

    // Removed componentDidMount as it was empty

    if (menu_name === 'Sign Out') {
        return (
            <div className={styles.menu_overlay_item} id={id} onClick={() => clerk.signOut()}>
                <b className={styles.menu_overlay_item_title}>{menu_name}</b>
            </div>
        );
    }

    return (
        <div 
            className={styles.menu_overlay_item} 
            id={id} 
            onClick={e => {
                e.preventDefault(); 
                setAppState({ ...app_state, menu_open: false });
                router.push(url_endpoint);
            }}
        >
            <b className={styles.menu_overlay_item_title}>{menu_name}</b>
        </div>
    );
}

export default withClerk(MenuOverlayButton);
